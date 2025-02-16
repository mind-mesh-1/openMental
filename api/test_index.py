import unittest
from fastapi.testclient import TestClient

from index import app

client = TestClient(app)


class ApiTestCase(unittest.TestCase):
    def test_analyze_sources(self):
        response = client.post(
            "/api/py/analyze_sources",
            json={
                "source_ids": ["1", "2", "3"],
                "question": "What is the summary?",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("analyzeSources executed", response.json()["message"])


if __name__ == "__main__":
    unittest.main()
