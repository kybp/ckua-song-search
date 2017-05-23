from unittest import TestCase
from server.query_parser import split_param

class SplitParamTest(TestCase):
    def test_empty_string_gets_two_empty_strings(self):
        self.assertEqual(split_param(''), ('', ''))
