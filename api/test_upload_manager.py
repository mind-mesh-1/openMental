import datetime
import os
import unittest
from unittest.mock import AsyncMock, patch
import pytest
from storage_manager.util import upload_file
from storage_manager import PosgresStorage


class TestPostgreSQLStorageHandler(unittest.IsolatedAsyncioTestCase):
    @patch("asyncpg.connect")
    async def test_save(self, mock_connect):
        mock_conn = AsyncMock()
        mock_connect.return_value = mock_conn
        handler = PosgresStorage("fake_database_url")
        await handler.save("test.txt", b"Test content")
        mock_conn.execute.assert_called_once()
        mock_conn.close.assert_called_once()

    @patch("asyncpg.connect")
    async def test_get(self, mock_connect):
        mock_conn = AsyncMock()
        mock_connect.return_value = mock_conn
        mock_conn.fetchrow.return_value = {
            "id": "123",
            "filename": "test.txt",
            "content_type": "text/plain",
            "size": 11,
            "uploaded_at": datetime.datetime.now(datetime.UTC),
            "metadata": "{}",
        }
        handler = PosgresStorage("fake_database_url")
        result = await handler.get("123")
        self.assertIsNotNone(result)
        self.assertEqual(result["filename"], "test.txt")
        mock_conn.close.assert_called_once()


# TODO: Test Pinecone Couroutine


# class TestLlamaIndexStorageHandler(unittest.IsolatedAsyncioTestCase):
#     @patch.dict(os.environ, {"PINECONE_API_KEY": "fake_pinecone_api_key"})
#     async def test_save(self):
#         handler = LlamaIndexStorageHandler(os.getenv("PINECONE_API_KEY"))
#         result = await handler.save("test.txt", b"Test content")
#         self.assertEqual(result["message"], "File uploaded successfully")


class TestUploadFileFunction(unittest.IsolatedAsyncioTestCase):
    @patch("storage_manager.PosgresStorage.save", new_callable=AsyncMock)
    @patch("storage_manager.VectorStorage.save", new_callable=AsyncMock)
    async def test_upload_file(self, mock_llama_save, mock_postgres_save):
        mock_postgres_save.return_value = None
        mock_llama_save.return_value = {"message": "File uploaded successfully"}
        result = await upload_file("test.txt", b"Test content")
        self.assertEqual(result["message"], "File uploaded successfully")
        mock_postgres_save.assert_called_once()
        mock_llama_save.assert_called_once()
