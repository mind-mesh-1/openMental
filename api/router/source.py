import os
import sys
import uuid
import datetime
import asyncpg
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse


from fastapi import APIRouter

from api.models import AnalyzeSourcesRequest
from api.storage_manager import PosgresStorage, VectorStorage

load_dotenv()

source_router = APIRouter()

DATABASE_URL = os.getenv("DATABASE_URL")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")


postgresql_handler = PosgresStorage()
vectorstorage_handler = VectorStorage()


@source_router.post("/source/upload")
async def upload_file(request: Request):
    try:
        form = await request.form()
        filename = form["fileName"]
        file = form["file"]
        buffer = await file.read()
        source_id = str(uuid.uuid4())
        content_type = "text/plain"
        size = len(buffer)
        uploaded_at = datetime.datetime.utcnow()
        conn = await asyncpg.connect(DATABASE_URL)

        indexer_resp = await vectorstorage_handler.save(filename, buffer)

        psql_resp = await postgresql_handler.save(
            filename, buffer, indexer_resp.doc_ref_id
        )

        return JSONResponse(
            content={
                "message": "File uploaded successfully",
                "path": "psql and llamaIndex",
                "psql_resp": psql_resp.model_dump(),
                "indexer_resp": indexer_resp.model_dump(),
            },
            status_code=200,
        )
    except Exception as e:
        print(f"Error saving to database: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=400)


@source_router.get("/source/list")
async def list_sources():
    try:
        items = await postgresql_handler.list()

        return JSONResponse(
            content={
                "message": "Files retrieved successfully",
                "sources": items,
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


@source_router.get("/source/{source_id}")
async def get_sources(source_id: str):
    try:
        source_id = str(source_id)
        item = await postgresql_handler.get(source_id)
        print(item)
        return JSONResponse(
            content={
                "message": "File retrieved successfully",
                "source_id": str(source_id),
                "item": item,
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


@source_router.delete("/source/{source_id}")
async def delete_source(source_id: str):
    try:
        await postgresql_handler.adelete(source_id)
        await vectorstorage_handler.adelete(source_id)
        return JSONResponse(
            content={"message": "File deleted successfully", "source_id": source_id},
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


# @source_router.get("/helloFastApi")
# def hello_fast_api():
#     openai_apikey = os.getenv("OPENAI_API_KEY")
#     print(f"openai_apikey: {openai_apikey}")
#     return {"message": "Hello from FastAPI"}
#
#
# @source_router.post("/analyze_sources")
# def analyze_sources(request: AnalyzeSourcesRequest):
#     source_ids = request.source_ids
#     request.question
#     request.question
#     # Placeholder for analyzeSources logic
#     return {"message": "analyzeSources executed"}


# @app.post("/api/py/chat")
# def hello_fast_api(request: QueryRequest):
#     query = request.query
#
#     index_reader = IndexReader("sources")
#     print(query)
#     chat_engine = index_reader.load_vector_index().morph_as_chat_engine()
#
#     response = chat_engine.chat(query=query, streaming=False)
#
#     print(response)
#
#     # async def stream_response():
#     #     async for token in streaming_response.response_gen:
#     #         print(token)
#     #         yield token
#
#     return response.response
