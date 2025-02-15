from fastapi.testclient import TestClient
from .index import app

def test_hello_fast_api():
    client = TestClient(app)
    response = client.get("/api/py/helloFastApi")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from FastAPI"}
