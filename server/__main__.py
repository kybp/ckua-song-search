from flask import Flask, jsonify, request
from flask.json import JSONEncoder
from pytz import timezone, UTC

from server.models import db, Song
from server.query_parser import search_from_query_string

app = Flask(__name__, static_folder='../dist')
app.config['JSONIFY_PRETTYPRINT_REGULAR']    = False
app.config['SQLALCHEMY_DATABASE_URI']        = 'postgres://localhost:5432/ckua'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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

@app.route('/search')
def search_route():
    search = search_from_query_string(request.query_string.decode())
    error  = search.error_message()
    if error:
        return jsonify({'error': error}), 400
    return jsonify(search.perform())

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/bundle.js')
def bundle():
    return app.send_static_file('bundle.js')

if __name__ == '__main__':
    db.init_app(app)
    app.run()
