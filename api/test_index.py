import unittest
from fastapi.testclient import TestClient

from api.index import app

client = TestClient(app)


class ApiTestCase(unittest.TestCase):
    def test_analyze_sources(self):
        response = client.post(
            "/api/py",
            json={
                "action": "analyzeSources",
                "params": {"source_ids": "1,2,3", "question": "What is the summary?"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("analyzeSources executed", response.json()["message"])

    def test_summarize_source(self):
        response = client.post(
            "/api/py", json={"action": "summarizeSource", "params": {"source_id": "1"}}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("summarizeSource executed", response.json()["message"])

    def test_unknown_action(self):
        response = client.post(
            "/api/py", json={"action": "unknownAction", "params": {}}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unknown action", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
