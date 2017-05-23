from flask_sqlalchemy import SQLAlchemy

# The text fields included in a song
FIELDS = ['artist', 'title', 'album']

db = SQLAlchemy()

class Song(db.Model):
    __tablename__ = 'songs'

    id      = db.Column(db.Integer, primary_key=True)
    title   = db.Column(db.String(512))
    artist  = db.Column(db.String(512))
    album   = db.Column(db.String(512))
    started = db.Column(db.DateTime())

    def next_songs(self, n):
        '''Return a list of the `n` songs played immediately after this song,
in ascending order of start time.'''
        return Song\
            .query\
            .filter(Song.started > self.started)\
            .order_by(Song.started.asc())\
            .limit(n)\
            .all()

    def previous_songs(self, n):
        '''Return a list of the `n` songs played immediately before this song,
in ascending order of start time.'''
        songs = Song\
            .query\
            .filter(Song.started < self.started)\
            .order_by(Song.started.desc())\
            .limit(n)\
            .all()
        songs.reverse()
        return songs
