from typing import List

from pydantic import BaseModel


class RequestBody(BaseModel):
    action: str
    params: dict


class QueryRequest(BaseModel):
    query: str


class AnalyzeSourcesRequest(BaseModel):
    sourceIds: List[str]
    question: str


class UploadRequest(BaseModel):
    fileName: str
    file: bytes
