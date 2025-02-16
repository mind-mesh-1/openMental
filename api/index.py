from fastapi import FastAPI

from dotenv import load_dotenv
from index_reader import IndexReader
import os
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

load_dotenv()
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")


class RequestBody(BaseModel):
    action: str
    params: dict


class QueryRequest(BaseModel):
    query: str


class AnalyzeSourcesRequest(BaseModel):
    source_ids: List[str]
    question: str


@app.post("/api/py/analyze_sources")
def analyze_sources(request: AnalyzeSourcesRequest):
    source_ids = request.source_ids
    question = request.question
    # Placeholder for analyzeSources logic
    return {"message": "analyzeSources executed"}


@app.get("/api/py/helloFastApi")
def hello_fast_api():
    openai_apikey = os.getenv("OPENAI_API_KEY")
    print(f"openai_apikey: {openai_apikey}")
    return {"message": "Hello from FastAPI"}


@app.post("/api/py/chat")
def hello_fast_api(request: QueryRequest):
    query = request.query

    index_reader = IndexReader("sources")
    print(query)
    chat_engine = index_reader.load_vector_index().morph_as_chat_engine()

    response = chat_engine.chat(query=query, streaming=False)

    print(response)

    # async def stream_response():
    #     async for token in streaming_response.response_gen:
    #         print(token)
    #         yield token

    return response.response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
