from llama_index.core.vector_stores import (
    MetadataFilters,
    FilterOperator,
    MetadataFilter,
)
from llama_index.core.workflow import Event
from llama_index.core.schema import NodeWithScore
from llama_index.core.prompts import PromptTemplate
from IPython.display import Markdown, display
from llama_index.vector_stores.pinecone import PineconeVectorStore
from dotenv import load_dotenv
load_dotenv()

CITATION_QA_TEMPLATE = PromptTemplate(
    "Please provide an answer based solely on the provided sources. "
    "When referencing information from a source, "
    "cite the appropriate source(s) using their corresponding numbers. "
    "Every answer should include at least one source citation. "
    "Only cite a source when you are explicitly referencing it. "
    "If none of the sources are helpful, you should indicate that. "
    "For example:\n"
    "Source 1:\n"
    "The sky is red in the evening and blue in the morning.\n"
    "Source 2:\n"
    "Water is wet when the sky is red.\n"
    "Query: When is water wet?\n"
    "Answer: Water will be wet when the sky is red [2], "
    "which occurs in the evening [1].\n"
    "Now it's your turn. Below are several numbered sources of information:"
    "\n------\n"
    "{context_str}"
    "\n------\n"
    "Query: {query_str}\n"
    "Answer: "
)

CITATION_REFINE_TEMPLATE = PromptTemplate(
    "Please provide an answer based solely on the provided sources. "
    "When referencing information from a source, "
    "cite the appropriate source(s) using their corresponding numbers. "
    "Every answer should include at least one source citation. "
    "Only cite a source when you are explicitly referencing it. "
    "If none of the sources are helpful, you should indicate that. "
    "For example:\n"
    "Source 1:\n"
    "The sky is red in the evening and blue in the morning.\n"
    "Source 2:\n"
    "Water is wet when the sky is red.\n"
    "Query: When is water wet?\n"
    "Answer: Water will be wet when the sky is red [2], "
    "which occurs in the evening [1].\n"
    "Now it's your turn. "
    "We have provided an existing answer: {existing_answer}"
    "Below are several numbered sources of information. "
    "Use them to refine the existing answer. "
    "If the provided sources are not helpful, you will repeat the existing answer."
    "\nBegin refining!"
    "\n------\n"
    "{context_msg}"
    "\n------\n"
    "Query: {query_str}\n"
    "Answer: "
)

DEFAULT_CITATION_CHUNK_SIZE = 512
DEFAULT_CITATION_CHUNK_OVERLAP = 20

class RetrieverEvent(Event):
    nodes: list[NodeWithScore]


class CreateCitationsEvent(Event):
    nodes: list[NodeWithScore]


from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.workflow import (
    Context,
    Workflow,
    StartEvent,
    StopEvent,
    step,
)

from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

from llama_index.core.schema import (
    MetadataMode,
    NodeWithScore,
    TextNode,
)

from llama_index.core.response_synthesizers import (
    ResponseMode,
    get_response_synthesizer,
)

from typing import Union, List
from llama_index.core.node_parser import SentenceSplitter


PINECONE_INDEX = "sources"
PINECONE_INDEX_NAME_SPACE = "test"
TOP_SIMILARITY = 5



index = VectorStoreIndex.from_vector_store(
    vector_store = PineconeVectorStore(
            index_name=PINECONE_INDEX,
            namespace=PINECONE_INDEX_NAME_SPACE,
            chunk_size=1024,
            add_sparse_vector=False,
            sparse_embedding_model=None,
        )
)




class CitationQueryEngineWorkflow(Workflow):
    @step
    async def retrieve(
        self, ctx: Context, ev: StartEvent
    ) -> Union[RetrieverEvent, None]:
        "Entry point for RAG, triggered by a StartEvent with `query`."
        query = ev.get("query")
        source_ids = ev.get("source_ids")
        if not query:
            return None

        print(f"Query the database with: {query}")

        # store the query in the global context
        await ctx.set("query", query)

        filters = MetadataFilters(
            filters=[
                MetadataFilter(
                    key="document_id",
                    operator=FilterOperator.IN,
                    value=source_ids,
                ),
            ]
        )
        if ev.index is None:
            print("Index is empty, load some documents before querying!")
            return None

        retriever = ev.index.as_retriever(similarity_top_k=TOP_SIMILARITY, filters = filters)
        nodes = retriever.retrieve(query)
        print(f"Retrieved {len(nodes)} nodes.")
        return RetrieverEvent(nodes=nodes)

    @step
    async def create_citation_nodes(
        self, ev: RetrieverEvent
    ) -> CreateCitationsEvent:
        nodes = ev.nodes

        new_nodes: List[NodeWithScore] = []

        text_splitter = SentenceSplitter(
            chunk_size=DEFAULT_CITATION_CHUNK_SIZE,
            chunk_overlap=DEFAULT_CITATION_CHUNK_OVERLAP,
        )

        for node in nodes:
            text_chunks = text_splitter.split_text(
                node.node.get_content(metadata_mode=MetadataMode.NONE)
            )

            for text_chunk in text_chunks:
                text = f"Source {len(new_nodes)+1}:\n{text_chunk}\n"

                new_node = NodeWithScore(
                    node=TextNode.parse_obj(node.node), score=node.score
                )
                new_node.node.text = text
                new_nodes.append(new_node)
        return CreateCitationsEvent(nodes=new_nodes)

    @step
    async def synthesize(
        self, ctx: Context, ev: CreateCitationsEvent
    ) -> StopEvent:
        """Return a streaming response using the retrieved nodes."""
        llm = OpenAI(model="gpt-4o-mini")
        query = await ctx.get("query", default=None)

        synthesizer = get_response_synthesizer(
            llm=llm,
            text_qa_template=CITATION_QA_TEMPLATE,
            refine_template=CITATION_REFINE_TEMPLATE,
            response_mode=ResponseMode.COMPACT,
            use_async=True,
        )

        response = await synthesizer.asynthesize(query, nodes=ev.nodes)
        return StopEvent(result=response)



citationEngine = CitationQueryEngineWorkflow()

if __name__ == "__main__":
    import asyncio
    source_ids = ["1f18d734-2fa8-4030-9a91-88f2f7432916","a103b9ab-3601-49f5-9384-47bf86b84d71"]
    async def main():
        result = await citationEngine.run(query="what is sam altman's attitude on ski and running start up", source_ids=source_ids,index=index)
        print(f"Answer: {result}")
        print('------------------------')
        print("Citations:------------------------")
        print('------------------------')

        for node in result.source_nodes:
            source_id = node.metadata['doc_ref_id']
            source_name = node.metadata['source_name']
            citation_id = node.id_
            score = node.score
            text = node.text
            print(f"ID: {source_id}, document_name: ${source_name} Score: {score}, Text: {text}")
            print('------------------------')

    asyncio.run(main())