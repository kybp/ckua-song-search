from datetime import datetime
from urllib.parse import unquote
from flask import Flask, jsonify, request
from flask.json import JSONEncoder
from flask_sqlalchemy import SQLAlchemy
from pytz import timezone, UTC
from sqlalchemy import text

app = Flask(__name__, static_folder='dist')
app.config['JSONIFY_PRETTYPRINT_REGULAR']    = False
app.config['SQLALCHEMY_DATABASE_URI']        = 'postgres://localhost:5432/ckua'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
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

class JSONSongEncoder(JSONEncoder):
    def default(self, obj):
        def to_utc(date):
            return timezone('Canada/Mountain').localize(date).astimezone(UTC)

        if isinstance(obj, Song):
            return {
                'title':   obj.title,
                'artist':  obj.artist,
                'album':   obj.album,
                'started': to_utc(obj.started)}
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

        if param_name in ['start', 'end', 'compare']:
            continue
        elif param_name == 'id':
            if query:
                result.append(query)
            query = {'id': value}
        else:
            query[param_name] = value

    if query:
        result.append(query)

    return result

FIELDS = ['artist', 'title', 'album']

class QueryField():
    def __init__(self):
        self.text       = ''
        self.lock_left  = False
        self.lock_right = False

    def normalized(self):
        return self.text.lower().strip()

def try_read_lock(parsed_query, unparsed_query, key):
    '''Determine if the `key` into `unparsed_query` represents a lock, and if
so, save it into `parsed_query`. Return `True` or `False` to indicate whether a
lock was saved.'''
    for field in FIELDS:
        is_locked = unparsed_query[key].lower() == 'true'

        if key == field + '-lockLeft':
            parsed_query[field].lock_left = is_locked
            return True
        elif key == field + '-lockRight':
            parsed_query[field].lock_right = is_locked
            return True

    return False

def parse_query(unparsed_query):
    '''Parse a query from a raw dict of parameters into a mapping of the fields
in `FIELDS` to `QueryField` instances.'''
    parsed_query = {field: QueryField() for field in FIELDS}

    for key in unparsed_query.keys():
        if key in FIELDS:
            parsed_query[key].text = unparsed_query[key]
            continue
        try_read_lock(parsed_query, unparsed_query, key)

    return parsed_query

class Search():
    def __init__(self, queries, compare, start_date, end_date):
        self.queries    = queries
        self.compare    = compare
        self.start_date = start_date
        self.end_date   = end_date

    def validate(self):
        def all_fields_empty(query):
            def is_empty(field):
                return len(field.text) == 0
            return all(map(is_empty, query.values()))

        error_message = None

        if self.compare and all(map(all_fields_empty, self.queries)):
            error_message = 'In a comparison search, each query must ' +\
                            'have at least 1 non-empty field.'
        elif all_fields_empty(self.queries[0]):
            error_message = 'A search must have at least 1 non-empty field.'

        return {'error': error_message} if error_message else None

    def search_series(self):
        next_queries = self.queries[1:]
        results      = []
        number_songs = len(next_queries)

        for song in self.find_songs(self.queries[0]):
            next_songs = song.next_songs(number_songs).all()
            if len(next_songs) < number_songs:
                continue
            found_match = True
            for i in range(number_songs):
                if not check_song(next_songs[i], next_queries[i]):
                    found_match = False
                    break
            if found_match:
                results.append([song] + next_songs)

        return results

    def search_compare(self):
        return [self.find_songs(query).all() for query in self.queries]

    def perform(self):
        if self.compare:
            return self.search_compare()
        else:
            return self.search_series()

    def find_songs(self, query):
        q = Song.query.order_by(Song.started.desc())

        def filter_contains(attr):
            query_attr = query[attr].normalized()\
                         .replace('=', '==')\
                         .replace('%', '=%')\
                         .replace('_', '=_')
            if not query_attr:
                return q
            if not query[attr].lock_left:
                query_attr = '%' + query_attr
            if not query[attr].lock_right:
                query_attr += '%'
            return q.filter(text("{} ilike :{} escape '='".format(attr, attr)))\
                .params(**{attr: query_attr})

        for field in FIELDS:
            if query[field].text:
                q = filter_contains(field)

        if self.start_date:
            q = q.filter(Song.started >= self.start_date)
        if self.end_date:
            q = q.filter(Song.started <= self.end_date)

        return q

    @classmethod
    def from_query_string(cls, query_string):
        compare    = False
        start_date = None
        end_date   = None

        for query_param in query_string.split('&'):
            param_name, value = split_param(query_param)
            if param_name == 'compare':
                compare = True
            elif param_name == 'start' and value:
                start_date = datetime.strptime(value, '%Y-%m-%d')
            elif param_name == 'end' and value:
                end_date = datetime.strptime(value, '%Y-%m-%d')

        queries = [parse_query(query) for query in split_queries(query_string)]
        return cls(queries, compare, start_date, end_date)

def check_song(song, query):
    '''Return whether the given `Song` instance satisfies `query`.'''
    def matches(attr):
        query_attr = query[attr].normalized()
        if not query_attr:
            return True
        model_attr = getattr(song, attr).lower()
        if query[attr].lock_left and not model_attr.startswith(query_attr):
            return False
        if query[attr].lock_right and not model_attr.endswith(query_attr):
            return False
        return query_attr in model_attr

    return all(map(matches, FIELDS))

@app.route('/search')
def search_route():
    search = Search.from_query_string(request.query_string.decode())
    errors = search.validate()
    if errors:
        return jsonify(errors), 400
    return jsonify(search.perform())

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/bundle.js')
def bundle():
    return app.send_static_file('bundle.js')

if __name__ == '__main__':
    app.run(debug=True)
