import os
import sys
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI


from router.source import source_router


sys.path.append(os.path.dirname(os.path.abspath(__file__)))


app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
app.include_router(source_router, prefix="/api/py")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
