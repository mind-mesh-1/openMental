import os
import sys

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from router.qa import qa_router
from router.source import source_router


sys.path.append(os.path.dirname(os.path.abspath(__file__)))


app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(source_router, prefix="/api/py")
app.include_router(qa_router, prefix="/api/py")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
