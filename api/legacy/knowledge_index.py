# import os
# from typing import List, Optional
#
# from llama_index.core.vector_stores import MetadataFilters
# from llama_index.vector_stores.pinecone import PineconeVectorStore
# from pinecone import Pinecone
# from llama_index.core import (
#     VectorStoreIndex,
#     SimpleDirectoryReader,
# )
# from llama_index.core import StorageContext
#
#
# class KnowledgeIndex:
#     def __init__(self, index_name: str):
#         self.client = Pinecone(api_key=os.getenv("PINECONE_API_KEY", "your-api-key"))
#         self.pc_index = self.client.Index(index_name)
#
#     async def load_from_directories(
#         self, absolute_source_dir: str
#     ) -> Optional[VectorStoreIndex]:
#         file_list = await self.get_source_filenames(absolute_source_dir)
#         count = len(file_list)
#         print(f"Found {count} files")
#
#         try:
#             rdr = SimpleDirectoryReader(callback)
#             docs = await rdr.load_data(directory_path=absolute_source_dir)
#             pcvs = PineconeVectorStore(
#                 index_name="sources", namespace="lama", chunk_size=512
#             )
#             ctx = StorageContext.from_defaults(vector_store=pcvs)
#             return VectorStoreIndex.from_documents(docs, storage_context=ctx)
#         except Exception as err:
#             print(f"Error in load directories: {err}")
#             return None
#
#     async def upload_to_index(
#         self, source_meta: dict, buffer: bytes
#     ) -> Optional[VectorStoreIndex]:
#         source_id = source_meta["sourceId"]
#         source_name = source_meta["sourceName"]
#
#         try:
#             document = Document(
#                 text=buffer.decode("utf-8"),
#                 metadata={"source_id": source_id, "source_name": source_name},
#             )
#             pcvs = PineconeVectorStore(
#                 index_name="sources", namespace="buffers", chunk_size=1024
#             )
#             ctx = await StorageContext.from_defaults(vector_store=pcvs)
#             return await VectorStoreIndex.from_documents(
#                 [document], storage_context=ctx
#             )
#         except Exception as err:
#             print(err)
#             raise err
#
#     async def query(self, query: str):
#         pcvs = PineconeVectorStore(
#             index_name="sources", namespace="buffers", chunk_size=512
#         )
#         index = await VectorStoreIndex.from_vector_store(pcvs)
#         return index.as_query_engine().query(query=query)
#
#     async def query_documents(self, document_ids: List[str], query: str):
#         pcvs = PineconeVectorStore(
#             index_name="sources", namespace="buffers", chunk_size=512
#         )
#         index = await VectorStoreIndex.from_vector_store(pcvs)
#         filters = MetadataFilters(
#             filters=[{"key": "source_id", "value": document_ids, "operator": "in"}]
#         )
#         query_engine = index.as_query_engine(pre_filters=filters, similarity_top_k=5)
#         return query_engine.query(query=query)
#
#     async def summarize_source(self, source_id: str):
#         pcvs = PineconeVectorStore(
#             index_name="sources", namespace="buffers", chunk_size=512
#         )
#         index = await VectorStoreIndex.from_vector_store(pcvs)
#         filters = MetadataFilters(
#             filters=[{"key": "source_id", "value": [source_id], "operator": "in"}]
#         )
#         query_engine = index.as_query_engine(pre_filters=filters, similarity_top_k=10)
#         return query_engine.query(query="summarize the article")
#
#     async def hard_delete_source(self, ref_doc_id: str):
#         try:
#             pcvs = PineconeVectorStore(
#                 index_name="sources", namespace="buffers", chunk_size=512
#             )
#             index = await VectorStoreIndex.from_vector_store(pcvs)
#             print("index", index)
#             resp = await index.delete_ref_doc(ref_doc_id)
#             print(resp)
#         except Exception as error:
#             print(f"Error deleting doc_id {ref_doc_id} from vector db: {error}")
#             raise error
#
#     async def list_all_chunks_for_document(self, source_id: str):
#         try:
#             ns = self.pc_index.namespace("buffers")
#             res = await ns.list({"source_id": {"$eq": source_id}})
#             print(res)
#         except Exception as error:
#             print(
#                 f"Error listing all chunks for source_id {source_id} from vector db: {error}"
#             )
#             raise error
#
#     async def hard_delete_namespace(self, namespace: str):
#         try:
#             await self.pc_index.namespace(namespace).delete_all()
#             print(f"Deleted all records in namespace {namespace}")
#         except Exception as err:
#             raise err
#
#     async def get_source_filenames(self, source_dir: str) -> List[str]:
#         # Implement the logic to get source filenames
#         pass
#
#
# # async def transform_absolute_path(path: str) -> List[BaseNode[Metadata]]:
# #     documents = await load_documents([path])
# #     vector_store = PineconeVectorStore(index_name="sources", namespace="lama")
# #     pipeline = IngestionPipeline(
# #         transformations=[
# #             SentenceSplitter(chunk_size=512, chunk_overlap=20),
# #             TitleExtractor(),
# #             OpenAIEmbedding(),
# #         ]
# #     )
# #     nodes = await pipeline.run(documents=[documents[0]])
# #     print(f"{len(nodes)} added to vector store")
# #     return nodes
