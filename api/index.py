import json
import os
import sys
import uuid
from typing import List
import datetime
import asyncpg
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pinecone.grpc import PineconeGRPC
from pydantic import BaseModel

from upload_manager import PostgreSQLStorageHandler, LlamaIndexStorageHandler

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

postgresql_handler = PostgreSQLStorageHandler(DATABASE_URL)
llamaindex_handler = LlamaIndexStorageHandler(PINECONE_API_KEY)


class RequestBody(BaseModel):
    action: str
    params: dict


class QueryRequest(BaseModel):
    query: str


class AnalyzeSourcesRequest(BaseModel):
    source_ids: List[str]
    question: str


class UploadRequest(BaseModel):
    fileName: str
    file: bytes


@app.post("/api/py/analyze_sources")
def analyze_sources(request: AnalyzeSourcesRequest):
    source_ids = request.source_ids
    request.question
    # Placeholder for analyzeSources logic
    return {"message": "analyzeSources executed"}


@app.post("/api/py/source/upload")
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
        try:

            # postgresql_handler.set_next(llamaindex_handler)

            psql_resp = await postgresql_handler.save(filename, buffer)
            indexer_resp = await llamaindex_handler.save(filename, buffer)

            return JSONResponse(
                content={
                    "message": "File uploaded successfully",
                    "path": "psql and llamaIndex",
                    "psql_resp": psql_resp,
                    "indexer_resp": indexer_resp,
                },
                status_code=200,
            )

        except Exception as e:
            print(f"Error saving to database: {e}")
            raise HTTPException(status_code=500, detail="Database error")
        finally:
            await conn.close()
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


@app.get("/api/py/source/{source_id}")
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


@app.get("/api/py/source")
async def list_sources():
    try:
        items = await postgresql_handler.list()
        return JSONResponse(
            content={
                "message": "Files retrieved successfully",
                "items": items,
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


@app.get("/api/py/helloFastApi")
def hello_fast_api():
    openai_apikey = os.getenv("OPENAI_API_KEY")
    print(f"openai_apikey: {openai_apikey}")
    return {"message": "Hello from FastAPI"}


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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
