from datetime import datetime
from urllib.parse import unquote
from server.models import FIELDS
from server.search import Search

class QueryField():
    '''A single text field in one song query.'''

    def __init__(self):
        self.text       = ''
        self.lock_left  = False
        self.lock_right = False

    def normalized(self):
        '''Return the text of the field in lowercase with all leading and
trailing whitespace removed'''
        return self.text.lower().strip()

def split_param(query_param):
    '''Return a `(key, value)` tuple from a 'key=value' string, and
de-URL-encode the value. If `query_param` is not of the form 'key=value',
return a tuple of two empty strings.'''
    try:
        param_name, value = query_param.split('=')
        return param_name, unquote(value)
    except ValueError:
        return '', ''

def split_queries(query_string):
    '''Split a query string into an array of dicts for each query. A new query
object is indicated in the query string by an 'id' parameter. This function
does no parsing or validating of the fields listed after 'id' parameters.'''
    result = []
    query  = {}

    for query_param in query_string.split('&'):
        param_name, value = split_param(query_param)

        if param_name in ['', 'start', 'end', 'compare']:
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

def try_parse_date(string):
    try:
        return datetime.strptime(string, '%Y-%m-%d')
    except ValueError:
        return None

def search_from_query_string(query_string):
    '''Return a `Search` instance parsed from `query_string`.'''
    compare    = False
    start_date = None
    end_date   = None

    for query_param in query_string.split('&'):
        param_name, value = split_param(query_param)
        if param_name == 'compare':
            compare = True
        elif param_name == 'start' and value:
            start_date = try_parse_date(value)
        elif param_name == 'end' and value:
            end_date = try_parse_date(value)

    queries = [parse_query(query) for query in split_queries(query_string)]
    return Search(queries, compare, start_date, end_date)
