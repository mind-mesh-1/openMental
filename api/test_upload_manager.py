import unittest
from unittest.mock import AsyncMock, patch
from api.upload_manager import PostgreSQLStorageHandler, LlamaIndexStorageHandler, upload_file

class TestPostgreSQLStorageHandler(unittest.IsolatedAsyncioTestCase):
    @patch('asyncpg.connect')
    async def test_save(self, mock_connect):
        mock_conn = AsyncMock()
        mock_connect.return_value = mock_conn
        handler = PostgreSQLStorageHandler('fake_database_url')
        await handler.save('test.txt', b'Test content')
        mock_conn.execute.assert_called_once()
        await mock_conn.close.assert_called_once()

    @patch('asyncpg.connect')
    async def test_get(self, mock_connect):
        mock_conn = AsyncMock()
        mock_connect.return_value = mock_conn
        mock_conn.fetchrow.return_value = {
            'id': '123',
            'filename': 'test.txt',
            'content_type': 'text/plain',
            'size': 11,
            'uploaded_at': datetime.datetime.utcnow(),
            'metadata': '{}'
        }
        handler = PostgreSQLStorageHandler('fake_database_url')
        result = await handler.get('123')
        self.assertIsNotNone(result)
        self.assertEqual(result['filename'], 'test.txt')
        await mock_conn.close.assert_called_once()

class TestLlamaIndexStorageHandler(unittest.IsolatedAsyncioTestCase):
    async def test_save(self):
        handler = LlamaIndexStorageHandler('fake_pinecone_api_key')
        result = await handler.save('test.txt', b'Test content')
        self.assertEqual(result['message'], 'File uploaded successfully')

class TestUploadFileFunction(unittest.IsolatedAsyncioTestCase):
    @patch('api.upload_manager.PostgreSQLStorageHandler.save', new_callable=AsyncMock)
    @patch('api.upload_manager.LlamaIndexStorageHandler.save', new_callable=AsyncMock)
    async def test_upload_file(self, mock_llama_save, mock_postgres_save):
        mock_postgres_save.return_value = None
        mock_llama_save.return_value = {'message': 'File uploaded successfully'}
        result = await upload_file('test.txt', b'Test content')
        self.assertEqual(result['message'], 'File uploaded successfully')
        mock_postgres_save.assert_called_once()
        mock_llama_save.assert_called_once()

if __name__ == '__main__':
    unittest.main()
