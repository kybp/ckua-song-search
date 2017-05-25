from datetime import datetime
from unittest import TestCase
from server.models import FIELDS
from server.query_parser import QueryField
from server.query_parser import split_queries, split_param
from server.query_parser import parse_query, try_read_lock
from server.query_parser import search_from_query_string
from server.search import Search

class QueryFieldTest(TestCase):
    def test_initially_empty_text(self):
        self.assertEqual(QueryField().text, '')

    def test_initially_unlocked_right(self):
        self.assertFalse(QueryField().lock_right)

    def test_initially_unlocked_left(self):
        self.assertFalse(QueryField().lock_left)

    def test_normalized_downcases_text(self):
        original_text    = 'Blah BLAH blAh'
        query_field      = QueryField()
        query_field.text = original_text
        self.assertEqual(query_field.normalized(), original_text.lower())

    def test_normalized_strips_leading_and_trailing_whitespace(self):
        base_text        = 'a  b  c'
        query_field      = QueryField()
        query_field.text = '   ' + base_text + '   '
        self.assertEqual(query_field.normalized(), base_text)

class SplitParamTest(TestCase):
    def test_empty_string_gets_two_empty_strings(self):
        self.assertEqual(split_param(''), ('', ''))

    def test_no_equal_sign_gets_two_empty_strings(self):
        self.assertEqual(split_param('abc'), ('', ''))

    def test_splits_key_and_value_on_equal_sign(self):
        key, value = 'a', 'b'
        self.assertEqual(split_param(key + '=' + value), (key, value))

    def test_decodes_value(self):
        self.assertEqual(split_param('a=b%20c'), ('a', 'b c'))

class SplitQueriesTest(TestCase):
    def test_returns_empty_list_for_empty_string(self):
        self.assertEqual(split_queries(''), [])

    def test_ignores_start(self):
        self.assertEqual(split_queries('start=2015-05-05'), [])

    def test_ignores_end(self):
        self.assertEqual(split_queries('end=2015-05-05'), [])

    def test_ignores_compare(self):
        self.assertEqual(split_queries('compare=true'), [])

    def test_adds_dict_for_id(self):
        id = '1'
        self.assertEqual(split_queries('id=' + id), [{'id': id}])

    def test_adds_keys_for_id(self):
        id, a, b = '1', '2', '3'
        self.assertEqual(split_queries('id={}&a={}&b={}'.format(id, a, b)),
                         [{'id': id, 'a': a, 'b': b}])

    def test_splits_queries_on_ids(self):
        id1, a1, b1 = '1', '2', '3'
        id2 = '4'
        id3, a3, b3 = '5', '6', '7'
        query = 'id={}&a={}&b={}&id={}&id={}&a={}&b={}'.format(
            id1, a1, b1, id2, id3, a3, b3)
        self.assertEqual(split_queries(query), [
            {'id': id1, 'a': a1, 'b': b1},
            {'id': id2},
            {'id': id3, 'a': a3, 'b': b3}
        ])

class TryReadLockTest(TestCase):
    def test_no_lock_for_empty_key(self):
        key      = '-lockLeft'
        parsed   = {}
        unparsed = {key: 'true'}
        self.assertFalse(try_read_lock(parsed, unparsed, key))
        self.assertEqual(parsed, {})

    def test_no_lock_for_non_field_key(self):
        key      = 'foo-lockLeft'
        parsed   = {}
        unparsed = {key: 'true'}
        self.assertNotIn(key, FIELDS)
        self.assertFalse(try_read_lock(parsed, unparsed, key))
        self.assertEqual(parsed, {})

    def test_lock_for_field_key(self):
        for field in FIELDS:
            key      = field + '-lockLeft'
            parsed   = {field: QueryField()}
            unparsed = {key: 'true'}
            self.assertTrue(try_read_lock(parsed, unparsed, key))
            self.assertTrue(parsed[field].lock_left)

class ParseQueryTest(TestCase):
    def test_creates_value_for_each_field_in_FIELDS(self):
        parsed = parse_query({})
        self.assertEqual(sorted(parsed.keys()), sorted(FIELDS))

    def test_creates_QueryField_for_each_field_in_FIELDS(self):
        self.assertTrue(all(isinstance(value, QueryField)
                            for value in parse_query({}).values()))

    def test_ignores_non_field_keys(self):
        key = 'key'
        self.assertNotIn(key, FIELDS)
        self.assertNotIn(key, parse_query({key: 'true'}).keys())

    def test_saves_field_keys(self):
        for field in FIELDS:
            text   = 'blah'
            parsed = parse_query({field: text})
            self.assertEqual(parsed[field].text, text)

    def test_saves_field_locks(self):
        field  = FIELDS[0]
        parsed = parse_query({field: 'blah', field + '-lockRight': 'true'})
        self.assertTrue(parsed[field].lock_right)

class SearchFromQueryStringTest(TestCase):
    def test_returns_Search_instance(self):
        self.assertTrue(isinstance(search_from_query_string(''), Search))

    def test_parses_start_date_as_None_if_absent(self):
        self.assertIsNone(search_from_query_string('').start_date)

    def test_parses_start_date_into_datetime_instance_if_present(self):
        search = search_from_query_string('start=2015-05-05')
        self.assertTrue(isinstance(search.start_date, datetime))

    def test_parses_start_date_as_None_if_invalid(self):
        search = search_from_query_string('start=foo')
        self.assertIsNone(search.start_date)

    def test_parses_end_date_as_None_if_absent(self):
        self.assertIsNone(search_from_query_string('').end_date)

    def test_parses_end_date_into_datetime_instance_if_present(self):
        search = search_from_query_string('end=2015-05-05')
        self.assertTrue(isinstance(search.end_date, datetime))

    def test_parses_end_date_as_None_if_invalid(self):
        search = search_from_query_string('end=foo')
        self.assertIsNone(search.end_date)

    def test_parses_compare_as_False_if_absent(self):
        self.assertFalse(search_from_query_string('').compare)

    def test_parses_compare_as_True_if_present(self):
        self.assertTrue(search_from_query_string('compare=').compare)

    def test_parses_queries(self):
        query_string = 'compare='
        number_of_queries = 4
        for i in range(number_of_queries):
            query_string += '&id={}'.format(i)
        search = search_from_query_string(query_string)
        self.assertEqual(len(search.queries), number_of_queries)
