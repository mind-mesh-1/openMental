import os
import sys

from fastapi import FastAPI


from router.source import source_router


sys.path.append(os.path.dirname(os.path.abspath(__file__)))


app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")


app.include_router(source_router, prefix="/api/py")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
