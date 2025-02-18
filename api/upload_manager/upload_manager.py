import json
import os
import uuid
from abc import ABC, abstractmethod
import datetime
import asyncpg
from llama_index.vector_stores.pinecone import PineconeVectorStore

from llama_index.core import (
    Document,
    StorageContext,
    VectorStoreIndex,
)

DATABASE_URL = os.getenv("DATABASE_URL")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")


# TODO: for save, pydantic model for file type
class StorageHandler(ABC):
    """
    Abstract base class for storage handlers.
    Defines the interface for saving, removing, getting, and listing files.
    """

    def __init__(self):
        self.next_handler = None

    # def set_next(self, handler):
    #     self.next_handler = handler
    #     return handler

    @abstractmethod
    async def save(self, filename: str, buffer: bytes):
        pass
        # if self.next_handler:
        #     return await self.next_handler.save(filename, buffer)

    @abstractmethod
    async def remove(self, source_id: str):
        pass

    @abstractmethod
    async def get(self, source_id: str):
        pass

    @abstractmethod
    async def list(self):
        pass


class PostgreSQLStorageHandler(StorageHandler):
    """
    PostgreSQL storage handler for saving, removing, getting, and listing files.
    """

    def __init__(self, database_url: str):
        super().__init__()
        self.database_url = database_url

    async def save(self, filename: str, buffer: bytes):
        source_id = str(uuid.uuid4())
        content_type = "text/plain"
        size = len(buffer)
        uploaded_at = datetime.datetime.now(datetime.UTC)
        conn = await asyncpg.connect(self.database_url)
        try:
            await conn.execute(
                """
                INSERT INTO uploads (id, filename, content_type, size, uploaded_at, metadata, buffer)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                """,
                source_id,
                filename,
                content_type,
                size,
                uploaded_at,
                json.dumps({}),
                buffer,
            )
            print("Upload to PostgreSQL complete")
        except Exception as e:
            print(f"Error saving to database: {e}")
            raise
        finally:
            await conn.close()

    async def remove(self, source_id: str):
        raise NotImplementedError("Remove method not implemented")

    async def get(self, source_id: str):
        conn = await asyncpg.connect(self.database_url)
        try:
            row = await conn.fetchrow(
                """
                SELECT * FROM uploads WHERE id = $1
                """,
                source_id,
            )
            if row:
                return {
                    "id": str(row["id"]),
                    "filename": row["filename"],
                    "content_type": row["content_type"],
                    "size": row["size"],
                    "uploaded_at": row["uploaded_at"].isoformat(),
                    "metadata": json.loads(row["metadata"]),
                }
            else:
                return None
        except Exception as e:
            print(f"Error retrieving from database: {e}")
            raise e
        finally:
            await conn.close()

    async def list(self):
        conn = await asyncpg.connect(self.database_url)
        try:
            rows = await conn.fetch(
                """
                SELECT id, filename FROM uploads
                """
            )
            return [
                {
                    "id": str(row["id"]),
                    "filename": row["filename"],
                    # "content_type": row["content_type"],
                    # "size": row["size"],
                    # "uploaded_at": row["uploaded_at"].isoformat(),
                    # "metadata": json.loads(row["metadata"]),
                }
                for row in rows
            ]
        except Exception as e:
            print(f"Error listing from database: {e}")
            raise e
        finally:
            await conn.close()


class LlamaIndexStorageHandler(StorageHandler):
    """
    LlamaIndex storage handler for saving, removing, getting, and listing files.
    """

    def __init__(self, pinecone_api_key: str):
        super().__init__()
        self.pinecone_api_key = pinecone_api_key

    async def save(self, filename: str, buffer: bytes):
        document = Document(
            text=buffer.decode("utf-8"),
            metadata={"source_id": str(uuid.uuid4()), "source_name": filename},
        )
        pcvs = PineconeVectorStore(
            index_name="sources", namespace="test", chunk_size=1024
        )
        ctx = StorageContext.from_defaults(vector_store=pcvs)
        index = VectorStoreIndex.from_documents([document], storage_context=ctx)
        print("Upload to LlamaIndex complete")
        return {"message": "File uploaded successfully", "path": "psql and llamaIndex"}

    async def remove(self, source_id: str):
        raise NotImplementedError("Remove method not implemented")

    async def get(self, source_id: str):
        raise NotImplementedError("Get method not implemented")

    async def list(self):
        raise NotImplementedError("List method not implemented")


async def upload_file(filename: str, buffer: bytes):
    postgresql_handler = PostgreSQLStorageHandler(DATABASE_URL)
    llamaindex_handler = LlamaIndexStorageHandler(PINECONE_API_KEY)

    # postgresql_handler.set_next(llamaindex_handler)

    psql_resp = await postgresql_handler.save(filename, buffer)
    indexer_resp = await llamaindex_handler.save(filename, buffer)

    return {
        "message": "File uploaded successfully",
        "path": "psql and llamaIndex",
        "psql_resp": psql_resp,
        "indexer_resp": indexer_resp,
    }
