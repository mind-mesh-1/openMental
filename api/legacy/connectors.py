# from llama_index.graph_stores.neo4j import Neo4jPropertyGraphStore
# from llama_index.vector_stores.neo4jvector import Neo4jVectorStore
# from neo4j import GraphDatabase
# from pinecone.grpc import PineconeGRPC
# from llama_index.vector_stores.pinecone import PineconeVectorStore
# from config import username, password, uri, embed_dim
#
#
# from config import *
#
#
# def get_neo4j_driver():
#     return GraphDatabase.driver(uri, auth=(username, password))
#
#
# def get_neo4j_vector_store():
#     vector_store = Neo4jVectorStore(username, password, uri, embed_dim)
#
#     logger.info(f"Neo4j Vector Store initialized {vector_store}")
#     return vector_store
#
#
# def get_neo4j_property_graph_store():
#     try:
#         return Neo4jPropertyGraphStore(username, password, uri)
#     except Exception as e:
#         logger.error(f"Error: {e}")
#         return None
#
#
# def get_pinecone_vector_store(index="quickstart", top_k=5):
#     pc = PineconeGRPC()
#     index = pc.Index(index)
#     description = index.describe_index_stats()
#
#     logger.info(description)
#     vector_store = PineconeVectorStore(pinecone_index=index, similarity_top_k=top_k)
#     return vector_store
