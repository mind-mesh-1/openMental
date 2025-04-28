from abc import ABC, abstractmethod
import os
import uuid
from typing import List
from llama_index.core.vector_stores.types import VectorStoreQuery

from llama_index.core import Document, StorageContext, VectorStoreIndex
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.pinecone import PineconeVectorStore
import datetime
import json
import os
import uuid

import asyncpg


PINECONE_INDEX = "sources"
PINECONE_INDEX_NAME_SPACE = "test"


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
    def ping(self):

        raise NotImplementedError("Ping method not implemented")

    @abstractmethod
    async def save(self, filename: str, buffer: bytes):
        pass
        # if self.next_handler:
        #     return await self.next_handler.save(filename, buffer)

    @abstractmethod
    async def adelete(self, source_id: str):
        pass

    @abstractmethod
    async def get(self, source_id: str):
        pass

    @abstractmethod
    async def list(self):
        pass


class VectorStorage(StorageHandler):
    """
    LlamaIndex storage handler for saving, removing, getting, and listing files.
    """

    def __init__(self):
        super().__init__()
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.embed_model = OpenAIEmbedding(api_key=os.getenv("OPENAI_API_KEY"))
        self.pcvs = PineconeVectorStore(
            index_name=PINECONE_INDEX,
            namespace=PINECONE_INDEX_NAME_SPACE,
            chunk_size=1024,
            add_sparse_vector=False,
            sparse_embedding_model=None,
        )

        self.pipeline = IngestionPipeline(
            transformations=[
                SemanticSplitterNodeParser(
                    buffer_size=1,
                    breakpoint_percentile_threshold=95,
                    embed_model=self.embed_model,
                ),
                self.embed_model,
            ],
            vector_store=self.pcvs,
        )

        self.index = VectorStoreIndex.from_vector_store(
            vector_store=self.pcvs,
        )

    def ping(self):
        try:
            resp = self.pcvs.client.describe_index_stats()
            print("Ping successful:", resp)
        except Exception as e:
            print(f"Pinecone ping failed: {e}")
            raise

    async def save(self, filename: str, buffer: bytes):
        document = Document(
            text=buffer.decode("utf-8"),
            metadata={"source_id": str(uuid.uuid4()), "source_name": filename},
        )

        # ctx = StorageContext.from_defaults(vector_store=self.pcvs)
        # index = VectorStoreIndex.from_documents([document], storage_context=ctx)
        nodes = self.pipeline.run(documents=[document], show_progress=True)

        print(nodes)
        print("Upload to vector_store complete")
        return {"message": "File uploaded successfully", "path": "psql and llamaIndex"}

    async def adelete(self, source_id: str):
        await self.index.adelete_ref_doc(ref_doc_id=source_id)

    def get(self, source_id: str):

        try:
            nodes = self.pcvs.client.query(
                namespace=PINECONE_INDEX_NAME_SPACE,
                filter={"source_id": {"$eq": source_id}},
                top_k=2,
                include_metadata=True,  # Include metadata in the response.
            )

            return nodes

        except Exception as e:
            print(f"Error retrieving from Pinecone: {e}")
            raise

    def get_nodes(self, node_ids: List[str]):
        query = VectorStoreQuery(node_ids = node_ids)
        result = self.pcvs.query(query)
        return result

    async def list(self):
        raise NotImplementedError("List method not implemented")


class PosgresStorage(StorageHandler):
    """
    PostgreSQL storage handler for saving, removing, getting, and listing files.
    """

    def __init__(self):
        super().__init__()
        self.database_url = os.getenv("DATABASE_URL")

    def ping(self):
        raise NotImplementedError("Ping method not implemented")

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

    async def adelete(self, source_id: str):
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
                    "text": row["buffer"].decode("utf-8"),  # Convert bytes to text
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
