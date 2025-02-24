from typing import List

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from llama_index.core import VectorStoreIndex
from pydantic import BaseModel
from llama_index.core.schema import NodeWithScore

from api.engine.CitationEngine import CitationQueryEngineWorkflow
from api.storage_manager import VectorStorage

qa_router = APIRouter()

vectorstorage_handler = VectorStorage()

w = CitationQueryEngineWorkflow()


# class ResponseWithCitation(BaseModel):
#     answer: str
#     citations: List[NodeWithScore]


@qa_router.post("/qa")
async def qa(request: Request):
    try:
        payload = await request.json()

        query = payload["query"]

        index = VectorStoreIndex.from_vector_store(
            vector_store=vectorstorage_handler.pcvs
        )
        result = await w.run(query=query, index=index)
        print(result)

        return JSONResponse(
            content={"message": "Query successful", "result": result.response},
            status_code=200,
        )

    except Exception as e:
        print(f"Error Retrieving Response: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=400)
