import unittest
from app.api.index import app

class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_analyze_sources(self):
        response = self.app.post('/api', json={
            'action': 'analyzeSources',
            'params': {
                'source_ids': '1,2,3',
                'question': 'What is the summary?'
            }
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('analyzeSources executed', response.get_data(as_text=True))

    def test_summarize_source(self):
        response = self.app.post('/api', json={
            'action': 'summarizeSource',
            'params': {
                'source_id': '1'
            }
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('summarizeSource executed', response.get_data(as_text=True))

    def test_unknown_action(self):
        response = self.app.post('/api', json={
            'action': 'unknownAction'
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('Unknown action', response.get_data(as_text=True))

if __name__ == '__main__':
    unittest.main()