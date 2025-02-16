import os

from llama_index.core import VectorStoreIndex
from llama_index.core.indices.vector_store import VectorIndexRetriever
from llama_index.vector_stores.pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from pinecone.grpc import PineconeGRPC

api_key = ""
from dotenv import load_dotenv

load_dotenv()

# Create Pinecone Vector Store
pc = PineconeGRPC(api_key=api_key)
pinecone_index = pc.Index("sources")
description = pinecone_index.describe_index_stats()

print(description)

vector_store = PineconeVectorStore(pinecone_index=pinecone_index, namespace="")
vector_index = VectorStoreIndex.from_vector_store(vector_store=vector_store)


# Grab 5 search results
retriever = VectorIndexRetriever(index=vector_index, similarity_top_k=5)

# Query vector DB
answer = retriever.retrieve("what did paul graham do in college?")

# Inspect results
print([i.get_content() for i in answer])
