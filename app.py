from datetime import datetime
from urllib.parse import unquote
from flask import Flask, jsonify, request
from flask.json import JSONEncoder
from flask_sqlalchemy import SQLAlchemy
from pytz import timezone, UTC
from sqlalchemy import text

app = Flask(__name__, static_folder='dist')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://localhost:5432/ckua'
db = SQLAlchemy(app)

class Song(db.Model):
    __tablename__ = 'songs'

    id      = db.Column(db.Integer, primary_key=True)
    title   = db.Column(db.String(512))
    artist  = db.Column(db.String(512))
    album   = db.Column(db.String(512))
    started = db.Column(db.DateTime())

    def next_songs(self, n):
        return Song\
            .query\
            .filter(Song.started > self.started)\
            .order_by(Song.started.asc())\
            .limit(n)

def to_utc(date):
    return timezone('Canada/Mountain').localize(date).astimezone(UTC)

class JSONSongEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Song):
            return {
                'title':   obj.title,
                'artist':  obj.artist,
                'album':   obj.album,
                'started': to_utc(obj.started) }
        return super(JSONSongEncoder, self).default(obj)
app.json_encoder = JSONSongEncoder

def split_param(query_param):
    param_name, value = query_param.split('=')
    return param_name, unquote(value)

def split_queries(query_string):
    '''Split a query string into an array of dicts for each query. A new query
object is indicated in the query string by an 'id' parameter. This function
does no parsing or validating of the fields listed after 'id' parameters.'''
    result = []
    query  = {}

    for query_param in query_string.split('&'):
        param_name, value = split_param(query_param)

        if param_name == 'start' or param_name == 'end':
            continue
        elif param_name == 'id':
            if query:
                result.append(query)
            query = { 'id': value }
        else:
            query[param_name] = value

    if query:
        result.append(query)

    return result

def get_start_and_end(query_string):
    '''Read the start and end dates from a query string and return a tuple.
Each date will be a datetime object if it was present, or None if it wasn't.'''
    start_date = None
    end_date   = None

    for query_param in query_string.split('&'):
        param_name, value = split_param(query_param)
        if param_name == 'start' and value:
            start_date = datetime.strptime(value, '%Y-%m-%d')
        elif param_name == 'end' and value:
            end_date = datetime.strptime(value, '%Y-%m-%d')

    return start_date, end_date

def try_read_lock(parsed_query, unparsed_query, key, field, side):
    lock_name = 'lock' + side

    if key == field + '-' + lock_name:
        parsed_query[field][lock_name] = unparsed_query[key].lower() == 'true'
        return True

    return False

def parse_query(unparsed_query):
    fields = ['artist', 'title', 'album']
    parsed_query = { field: { 'text': '' } for field in fields}
    parsed_query['id'] = unparsed_query['id']

    for key in unparsed_query.keys():
        if key in fields:
            parsed_query[key]['text'] = unparsed_query[key]
            continue
        for field in fields:
            if try_read_lock(parsed_query, unparsed_query,
                             key, field, 'Left'):
                break
            elif try_read_lock(parsed_query, unparsed_query,
                               key, field, 'Right'):
                break

    return parsed_query

def get_search_parameters(query_string):
    queries = [parse_query(query) for query in split_queries(query_string)]
    start_date, end_date = get_start_and_end(query_string)
    return {
        'queries':    queries,
        'start_date': start_date,
        'end_date':   end_date }

def normalize_query_attr(attr):
    return attr.lower().strip()

def find_songs(search_parameters, query):
    q = Song.query.order_by(Song.started.desc())

    def filter_contains(attr):
        query_attr = normalize_query_attr(query[attr]['text'])\
                     .replace('=', '==')\
                     .replace('%', '=%').replace('_', '=_')
        if not query_attr:
            return q
        if not query[attr]['lockLeft']:
            query_attr = '%' + query_attr
        if not query[attr]['lockRight']:
            query_attr += '%'
        return q.filter(text("{} ilike :{} escape '='".format(attr, attr)))\
            .params(**{attr: query_attr})

    if 'artist' in query:
        q = filter_contains('artist')
    if 'title' in query:
        q = filter_contains('title')
    if 'album' in query:
        q = filter_contains('album')

    start_date = search_parameters.get('start_date', '')
    if start_date:
        q = q.filter(Song.started >= start_date)
    end_date = search_parameters.get('end_date', '')
    if end_date:
        q = q.filter(Song.started <= end_date)

    return q

def check_song(song, query):
    def matches(attr):
        if attr not in query or not query[attr]['text']:
            return True
        model_attr = getattr(song, attr).lower()
        query_attr = normalize_query_attr(query[attr]['text'])
        if query[attr]['lockLeft'] and not model_attr.startswith(query_attr):
            return False
        if query[attr]['lockRight'] and not model_attr.endswith(query_attr):
            return False
        return query_attr in model_attr
    if not matches('artist'):
        return False
    if not matches('title'):
        return False
    if not matches('album'):
        return False
    return True

def validate_queries(queries):
    minimum_term_length = 3
    def not_long_enough(value):
        if not isinstance(value, dict):
            return True
        elif 'text' not in value:
            return False
        else:
            return len(value['text']) < minimum_term_length
    error_message = 'At least one search field per query must ' +\
                    'have at least {} characters'.format(minimum_term_length)
    if all(map(not_long_enough, queries[0].values())):
        return {'error': error_message }

@app.route('/search')
def search():
    search_parameters = get_search_parameters(request.query_string.decode())
    errors = validate_queries(search_parameters['queries'])
    if errors is not None:
        return jsonify(errors), 400
    next_queries = search_parameters['queries'][1:]
    results = []
    n_songs = len(search_parameters['queries']) - 1
    for song in find_songs(search_parameters, search_parameters['queries'][0]):
        next_songs = song.next_songs(n_songs).all()
        if len(next_songs) < n_songs:
            continue
        found_match = True
        for i in range(n_songs):
            if not check_song(next_songs[i], next_queries[i]):
                found_match = False
                break
        if found_match:
            results.append([song] + next_songs)
    return jsonify(results)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/bundle.js')
def bundle():
    return app.send_static_file('bundle.js')

if __name__ == '__main__':
    app.run(debug=True)
