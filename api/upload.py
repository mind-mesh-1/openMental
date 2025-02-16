import os
import uuid
from pathlib import Path

import asyncpg
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
STORAGE_DIRECTORY = Path("/home/jingyi/WebstormProjects/copilot-v2/public/uploads")

app = FastAPI()


class UploadRequest(BaseModel):
    fileName: str
    file: bytes


async def save_to_file_system(buffer: bytes, extension: str) -> str:
    try:
        file_name = f"{uuid.uuid4()}.{extension}"
        file_path = STORAGE_DIRECTORY / file_name
        file_path.write_bytes(buffer)
        return f"/uploads/{file_name}"
    except Exception as e:
        print(f"Error saving to file system: {e}")
        return None
