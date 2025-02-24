# import os
# from llama_index.core import VectorStoreIndex, PropertyGraphIndex
#
# # from llama_index.postprocessor.cohere_rerank import CohereRerank
# from llama_index.embeddings.openai import OpenAIEmbedding
#
# from connectors import get_pinecone_vector_store, get_neo4j_property_graph_store
#
# api_key = os.environ["COHERE_API_KEY"]
#
#
# class IndexReader:
#     def __init__(self, index_name):
#         self.index = None
#         self.index_name = index_name
#
#     def load_vector_index(self):
#         try:
#             vector_store = get_pinecone_vector_store(self.index_name)
#             index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
#             print(index)
#             self.index = index
#             return self
#         except Exception as e:
#             print(e)
#
#     def load_neo4j_index(self):
#         index = PropertyGraphIndex.from_existing(
#             property_graph_store=get_neo4j_property_graph_store(),
#             embed_model=OpenAIEmbedding(model_name="text-embedding-3-small"),
#             show_progress=True,
#         )
#
#         self.index = index
#         return self
#
#     def morph_as_query_engine(self, streaming=False, use_cohere_rerank=True):
#         if self.index is None:
#             raise ValueError("Index is not initialized")
#         query_engine = self.index.as_query_engine(
#             streaming=streaming,
#             similarity_top_k=10,
#             # node_postprocessors=[cohere_rerank],
#         )
#         return query_engine
#
#     def morph_as_chat_engine(self):
#         if self.index is None:
#             raise ValueError("Index is not initialized")
#         chat_engine = self.index.as_chat_engine(
#             chat_mode="best",
#             verbose=True,
#         )
#         return chat_engine
