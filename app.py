from urllib.parse import unquote
from flask import Flask, jsonify, request
from flask.json import JSONEncoder
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

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

class JSONSongEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Song):
            return {
                'title':   obj.title,
                'artist':  obj.artist,
                'album':   obj.album,
                'started': obj.started }
        return super(JSONSongEncoder, self).default(obj)
app.json_encoder = JSONSongEncoder

def get_song_queries(query_string):
    queries = []
    query   = {}

    for query_param in query_string.split('&'):
        param_name, value = query_param.split('=')
        value = unquote(value)
        if param_name in query:
            queries.append(query)
            query = {}
        if param_name in ['artist', 'title', 'album']:
            query[param_name] = value

    if query:
        queries.append(query)

    return queries

def normalize_query_attr(attr):
    return attr.lower().strip()

def find_songs(query):
    q = Song.query.order_by(Song.started.desc())

    def filter_contains(attr):
        model_attr = func.lower(getattr(Song, attr))
        query_attr = normalize_query_attr(query[attr])
        return q.filter(model_attr.contains(query_attr))

    if 'artist' in query:
        q = filter_contains('artist')
    if 'title' in query:
        q = filter_contains('title')
    if 'album' in query:
        q = filter_contains('album')

    return q

def check_song(song, query):
    def matches(attr):
        if attr not in query or not query[attr]:
            return True
        model_attr = getattr(song, attr).lower()
        query_attr = normalize_query_attr(query[attr])
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
    long_enough = lambda value: len(value) < minimum_term_length
    if all(map(long_enough, queries[0].values())):
        return {'error': 'At least one search field per query must ' +
                         'have at least {} characters'.format(
                             minimum_term_length)}

@app.route('/search')
def search():
    queries = get_song_queries(request.query_string.decode())
    errors = validate_queries(queries)
    if errors is not None:
        return jsonify(errors), 400
    next_queries = queries[1:]
    results = []
    n_songs = len(queries) - 1
    for song in find_songs(queries[0]):
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
