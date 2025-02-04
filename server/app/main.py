from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
from llama_index import Document, VectorStoreIndex, SimpleDirectoryReader
from llama_index.indices.base import BaseIndex

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store indices in memory (in a real app, you'd want to persist these)
document_indices: Dict[str, BaseIndex] = {}

class QuestionRequest(BaseModel):
    source_id: str
    question: str

@app.post("/upload")
async def upload_document(file: UploadFile):
    try:
        # Create a unique source ID
        source_id = f"doc_{len(document_indices)}"
        
        # Save the file temporarily
        file_path = f"server/data/{source_id}_{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Load and index the document
        documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
        index = VectorStoreIndex.from_documents(documents)
        
        # Store the index
        document_indices[source_id] = index
        
        # Clean up
        os.remove(file_path)
        
        return {"source_id": source_id, "message": "Document processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_document(request: QuestionRequest):
    try:
        if request.source_id not in document_indices:
            raise HTTPException(status_code=404, detail="Source ID not found")
        
        # Get the query engine for the index
        query_engine = document_indices[request.source_id].as_query_engine()
        
        # Execute the query
        response = query_engine.query(request.question)
        
        return {
            "answer": str(response),
            "source_id": request.source_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sources")
async def list_sources():
    return {"sources": list(document_indices.keys())}