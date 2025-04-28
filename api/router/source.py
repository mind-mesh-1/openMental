# Standard library imports
import os
import sys
import uuid
import datetime

# Third-party imports
import asyncpg
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import JSONResponse

# Local application imports
from api.agents.CitationAgent import citationEngine
from api.models.models import AnalyzeSourcesRequest
from api.storage_manager import PosgresStorage, VectorStorage

# Load environment variables
load_dotenv()

# Router and storage initialization
source_router = APIRouter()
DATABASE_URL = os.getenv("DATABASE_URL")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
postgresql_handler = PosgresStorage()
vectorstorage_handler = VectorStorage()

# File upload and management routes
@source_router.post("/source/upload")
async def upload_file(request: Request):
    try:
        form = await request.form()
        filename = form["fileName"]
        file = form["file"]
        buffer = await file.read()

        psql_resp = await postgresql_handler.save(filename, buffer)
        indexer_resp = await vectorstorage_handler.save(filename, buffer)

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
        return JSONResponse(content={"error": str(e)}, status_code=400)

@source_router.get("/source/list")
async def list_sources():
    try:
        items = await postgresql_handler.list()
        return JSONResponse(
            content={"message": "Files retrieved successfully", "items": items},
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

@source_router.get("/source/{source_id}")
async def get_sources(source_id: str):
    try:
        item = await postgresql_handler.get(str(source_id))
        return JSONResponse(
            content={"message": "File retrieved successfully", **item},
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


@source_router.get("/source/citation/{citation_id}")
async def get_citation(citation_id: str):
    try:
        print(f"Retrieving citation with ID: {citation_id}")
        nodes = await vectorstorage_handler.get_nodes([citation_id])
        return JSONResponse(
            content={"message": "chunk retrieved successfully", **nodes},
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

# Question answering route
@source_router.post("/source/qa")
async def analyze_sources(request: AnalyzeSourcesRequest):
    try:
        engine_result = await citationEngine.run(
            query=request.question,
            index=vectorstorage_handler.index,
            source_ids=request.sourceIds
        )

        citations = [{
            "source_id": node.metadata["doc_ref_id"],
            "source_name": node.metadata["source_name"],
            "citation_id": node.id_,
            "score": node.score,
            "text": node.text,
        } for node in engine_result.source_nodes]

        return JSONResponse(
            content={
                "message": "query_executed_successfully",
                "response": engine_result.response,
                "citations": citations,
            },
            status_code=200,
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)