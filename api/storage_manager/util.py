from .Storage import PosgresStorage
from .Storage import VectorStorage


async def upload_file(filename: str, buffer: bytes):

    # postgresql_handler.set_next(llamaindex_handler)

    psql_resp = await PosgresStorage.save(filename, buffer)
    indexer_resp = await VectorStorage.save(filename, buffer)

    return {
        "message": "File uploaded successfully",
        "path": "psql and llamaIndex",
        "psql_resp": psql_resp,
        "indexer_resp": indexer_resp,
    }
