import logging
import os

import tiktoken
from dotenv import load_dotenv
from phoenix.otel import register
from llama_index.llms.openai import OpenAI
from llama_index.core import Settings
from openinference.instrumentation.llama_index import LlamaIndexInstrumentor
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

uri = os.environ.get("NEO4J_URI", "")
username = os.environ.get("NEO4J_USERNAME", "")
password = os.environ.get("NEO4J_PASSWORD", "")
embed_dim = 1536
openai_api_key = os.getenv("OPENAI_API_KEY")
llama_cloud_api_key = os.getenv("LLAMA_CLOUD_API_KEY")

Settings.llm = OpenAI(model="gpt-4o")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.context_window = 4096
Settings.num_output = 256
Settings.tokenizer = tiktoken.encoding_for_model("gpt-4o").encode
# Settings.embed_model = HuggingFaceEmbedding(
#     model_name="BAAI/bge-small-en-v1.5"
# )
# tracer_provider = register(
#     project_name=os.environ['PROJECT_NAME'],
#     endpoint="https://app.phoenix.arize.com/v1/traces",
# )
# LlamaIndexInstrumentor().instrument(tracer_provider=tracer_provider)
tracer_provider = register(
    project_name=os.environ["PROJECT_NAME"],
    endpoint="https://app.phoenix.arize.com/v1/traces",
)
