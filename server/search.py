from server.models import Song, FIELDS
from sqlalchemy import text

def all_fields_empty(query):
    '''Return `True` if the text of every field in `query` is empty,
otherwise return `False`.'''
    def is_empty(field):
        return len(normalized(field)) == 0
    return all(map(is_empty, query.values()))

def normalized(field):
    '''Return the text of the field in lowercase with all leading and
trailing whitespace removed'''
    return field['text'].lower().strip()

class Search():
    '''A search to be run in the database. Searches can be created from a request
with `Search.from_request`. Once created, a search should be validated with the
`error_message` method, which will return `None` if the search is valid. A
search can then be executed with `perform`.'''

    @classmethod
    def from_request(cls, request):
        json = request.get_json()
        return cls(
            [{field: query[field] for field in FIELDS}
             for query in json.get('queries')],
            json.get('compare'),
            json.get('startDate'),
            json.get('endDate')
        )

    def __init__(self, queries, compare, start_date, end_date):
        self.queries    = queries
        self.compare    = compare
        self.start_date = start_date
        self.end_date   = end_date

    def error_message(self):
        '''If the search should not be performed, return an error message
indicating why not. If the search is valid, return None.'''
        error_message = None

        if self.compare and any(map(all_fields_empty, self.queries)):
            error_message = 'In a comparison search, each query must ' +\
                            'have at least 1 non-empty field.'
        elif all(map(all_fields_empty, self.queries)):
            error_message = 'A search must have at least 1 non-empty field.'

        return error_message

    def search_series(self):
        '''Run the search, treating the list of queries as a sequence of
consecutive songs to find. To be called by `perform`.'''
        key_index = None
        for i, query in enumerate(self.queries):
            if not all_fields_empty(query):
                key_index = i
                break
        key_query = self.queries[key_index]
        matching_songs = self.find_songs(key_query)
        queries_after  = self.queries[key_index + 1:]
        number_songs_before = key_index
        number_songs_after  = len(queries_after)
        results = []

        for song in matching_songs:
            songs_after = song.next_songs(number_songs_after)
            if len(songs_after) < number_songs_after:
                continue
            found_match = True
            for i in range(number_songs_after):
                if not check_song(songs_after[i], queries_after[i]):
                    found_match = False
                    break
            if found_match:
                songs_before = song.previous_songs(number_songs_before)
                results.append(songs_before + [song] + songs_after)

        return results

    def search_compare(self):
        '''Run the search, treating each query as an individual single-song
search. To be called by `perform`.'''
        return [self.find_songs(query).all() for query in self.queries]

    def perform(self):
        '''Run the search and return the results as a list of lists, where each
child list is one match.'''
        if self.compare:
            return self.search_compare()
        else:
            return self.search_series()

    def find_songs(self, query):
        '''Return all songs from the database that match `query`.'''
        q = Song.query.order_by(Song.started.desc())

        def filter_contains(attr):
            query_attr = normalized(query[attr])\
                         .replace('=', '==')\
                         .replace('%', '=%')\
                         .replace('_', '=_')
            if not query_attr:
                return q
            if not query[attr]['lockLeft']:
                query_attr = '%' + query_attr
            if not query[attr]['lockRight']:
                query_attr += '%'
            return q.filter(text("{} ilike :{} escape '='".format(attr, attr)))\
                .params(**{attr: query_attr})

        for field in FIELDS:
            if query[field]['text']:
                q = filter_contains(field)

        if self.start_date:
            q = q.filter(Song.started >= self.start_date)
        if self.end_date:
            q = q.filter(Song.started <= self.end_date)

        return q

def check_song(song, query):
    '''Return whether the given `Song` instance satisfies `query`.'''
    def matches(attr):
        query_attr = normalized(query[attr])
        if not query_attr:
            return True
        model_attr = getattr(song, attr).lower()
        if query[attr]['lockLeft'] and not model_attr.startswith(query_attr):
            return False
        if query[attr]['lockRight'] and not model_attr.endswith(query_attr):
            return False
        return query_attr in model_attr

    return all(map(matches, FIELDS))
