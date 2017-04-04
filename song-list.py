#!/usr/bin/env python3
from datetime import date, datetime
from html.parser import HTMLParser
from sys import stderr
from urllib.request import Request, urlopen
import sqlalchemy as sql
from sqlalchemy.exc import IntegrityError

db = sql.create_engine('postgres://localhost:5432/ckua')
db_metadata = sql.MetaData(db)

songs = sql.Table(
    'songs', db_metadata,
    sql.Column('id',      sql.Integer, primary_key=True),
    sql.Column('title',   sql.String(512)),
    sql.Column('artist',  sql.String(512)),
    sql.Column('album',   sql.String(512)),
    sql.Column('started', sql.DateTime())
)
songs.create(checkfirst=True)

class Song():
    insert = songs.insert()

    def __init__(self, title, artist, album, started, date):
        self.title   = title
        self.artist  = artist
        self.album   = album
        self.started = self.datetime_from_string(started, date)

    def datetime_from_string(self, string, date):
        time = datetime.strptime(string, "%I:%M %p")
        return datetime(date.year, date.month, date.day,
                        time.hour, time.minute)

    def persist(self):
        try:
            self.insert.execute(
                title=self.title, artist=self.artist,
                album=self.album, started=self.started)
        except IntegrityError as err:
            print('Error persisting {}: {}'.format(self, err))

    def __repr__(self):
        return '<Song title="{}" artist="{}" album="{}" started="{}">'.format(
            self.title, self.artist, self.album, self.started
        )

class SongListParser(HTMLParser):
    TOTAL_FIELDS = 4

    def __init__(self, date):
        super().__init__()
        self.date           = date
        self.in_song_list   = False
        self.awaiting_field = False
        self.songs          = []
        self.song_fields    = []
        self.div_depth      = 0

    def classes_from_attrs(self, attrs):
        try:
            return next(c for c in attrs if c[0] == 'class')[1].split()
        except StopIteration:
            return None

    def is_song_list(self, attrs):
        classes = self.classes_from_attrs(attrs)
        if classes is None:
            return False
        return 'song-list' in classes

    def is_song_field(self, attrs):
        if not self.in_song_list:
            return False
        classes = self.classes_from_attrs(attrs)
        if classes is None:
            return False
        return 'col-xs-3' in classes

    def handle_starttag(self, tag, attrs):
        if tag == 'div':
            self.div_depth += 1
        if self.is_song_list(attrs):
            self.in_song_list = True
            self.div_depth = 1
            return
        if not self.in_song_list:
            return
        if not self.is_song_field(attrs):
            return
        self.awaiting_field = True

    def handle_data(self, data):
        if not self.awaiting_field:
            return
        self.song_fields.append(data)
        if len(self.song_fields) == self.TOTAL_FIELDS:
            self.push_song()
        self.awaiting_field = False

    def handle_endtag(self, tag):
        if self.in_song_list and self.div_depth > 0:
            self.div_depth -= 1
            if self.div_depth == 0:
                self.in_song_list = False

    def push_song(self):
        assert len(self.song_fields) == self.TOTAL_FIELDS
        title, artist, album, started = self.song_fields
        self.songs.append(Song(title, artist, album, started, self.date))
        self.song_fields = []

def read_songs_for_date(date):
    url = 'http://www.ckua.com/features/playlist?date={}'.format(
        date.isoformat())
    try:
        user_agent = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7'
        req = urlopen(Request(url, headers={'User-Agent': user_agent}))
        html = req.read().decode()
        print('read data from date {}'.format(date))
    except Exception as err:
        print('requesting "{}" failed: {}'.format(url, err), file=stderr)
        exit(1)
    parser = SongListParser(date)
    parser.feed(html)
    for song in parser.songs:
        song.persist()

def main():
    read_songs_for_date(date(2017, 4, 3))

if __name__ == '__main__':
    main()
