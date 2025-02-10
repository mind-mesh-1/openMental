import fs from 'fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'path';
import dotenv from 'dotenv';
import {
  VectorStoreIndex,
  OpenAI,
  OpenAIEmbedding,
  IngestionPipeline,
  storageContextFromDefaults,
  MetadataFilters,
  Document,
  BaseNode,
  Metadata,
  TitleExtractor,
} from 'llamaindex';
import { PineconeVectorStore } from '@llamaindex/pinecone';
import { SimpleDirectoryReader } from '@llamaindex/readers/directory';
import { Index, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

import { Settings } from '@llamaindex/core/global';
import { loadDocuments } from '@/app/dao/utils.server';
import { SentenceSplitter } from '@llamaindex/core/node-parser';
import { EngineResponse } from '@llamaindex/core/schema';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables from a specific .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
Settings.llm = new OpenAI();
Settings.embedModel = new OpenAIEmbedding({
  model: 'text-embedding-3-small',
  dimensions: 1536,
});

async function getSourceFilenames(sourceDir: string) {
  return await fs
    .readdir(sourceDir)
    .then((fileNames) => fileNames.map((file) => sourceDir + '/' + file));
}

function callback(
  category: string,
  name: string,
  status: unknown,
  message: string = ''
): boolean {
  console.log(category, name, status, message);
  return true;
}

class KnowledgeIndex {
  private client: Pinecone;
  private pc_index: Index<RecordMetadata>;
  public constructor(indexName: string) {
    this.client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'your-api-key',
    });
    this.pc_index = this.client.Index(indexName);
  }

  public async loadFromDirectories(
    absoluteSourceDir: string
  ): Promise<VectorStoreIndex | undefined> {
    // const sourceDir = '/home/jingyi/WebstormProjects/copilot-v2/public/uploads';
    const fileList = await getSourceFilenames(absoluteSourceDir);
    const count = fileList.length;
    console.log(`Found ${count} files`);

    try {
      const rdr = new SimpleDirectoryReader(callback);
      const docs = await rdr.loadData({ directoryPath: absoluteSourceDir });
      const pcvs = new PineconeVectorStore({
        indexName: 'sources',
        namespace: 'lama',
        chunkSize: 512,
      });

      const ctx = await storageContextFromDefaults({ vectorStore: pcvs });

      return await VectorStoreIndex.fromDocuments(docs, {
        storageContext: ctx,
      });
    } catch (err) {
      console.error('Error in load directories', err);
      return undefined;
    }
  }

  //TODO: what are different indexing strategies from llamaIndex
  public async uploadToIndex(
    sourceMeta: {
      sourceId: string;
      sourceName: string;
    },
    buffer: Buffer<ArrayBufferLike>
  ): Promise<VectorStoreIndex | undefined> {
    const { sourceId, sourceName } = sourceMeta;

    try {
      const document = new Document({
        text: buffer.toString('utf-8'),
        metadata: {
          source_id: sourceId,
          source_name: sourceName,
        },
      });

      const pcvs = new PineconeVectorStore({
        indexName: 'sources',
        namespace: 'buffers',
        chunkSize: 1024,
      });

      const ctx = await storageContextFromDefaults({ vectorStore: pcvs });

      const resp = await VectorStoreIndex.fromDocuments([document], {
        storageContext: ctx,
      });

      return resp;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async query(query: string) {
    const pcvs = new PineconeVectorStore({
      indexName: 'sources',
      namespace: 'buffers',
      chunkSize: 512,
    });

    const index = await VectorStoreIndex.fromVectorStore(pcvs);

    return index.asQueryEngine().query({ query });
  }

  async queryDocuments(
    documentIds: string[],
    query: string
  ): Promise<EngineResponse> {
    const pcvs = new PineconeVectorStore({
      indexName: 'sources',
      namespace: 'buffers',
      chunkSize: 512,
    });

    const index = await VectorStoreIndex.fromVectorStore(pcvs);

    const filters: MetadataFilters = {
      filters: [
        {
          key: 'source_id',
          value: documentIds,
          operator: 'in',
        },
      ],
    };

    const queryEngine = index.asQueryEngine({
      preFilters: filters,
      similarityTopK: 5,
    });

    return queryEngine.query({ query });
  }

  async summarizeSource(source_id: string) {
    const pcvs = new PineconeVectorStore({
      indexName: 'sources',
      namespace: 'buffers',
      chunkSize: 512,
    });

    const index = await VectorStoreIndex.fromVectorStore(pcvs);

    const filters: MetadataFilters = {
      filters: [
        {
          key: 'source_id',
          value: [source_id],
          operator: 'in',
        },
      ],
    };

    const queryEngine = index.asQueryEngine({
      preFilters: filters,
      similarityTopK: 10,
      // retriever: index.asRetriever({ mode: SummaryRetrieverMode.LLM }),
    });

    return queryEngine.query({ query: 'summarize the article' });
  }

  async hardDeleteSource(ref_doc_id: string) {
    try {
      const pcvs = new PineconeVectorStore({
        indexName: 'sources',
        namespace: 'buffers',
        chunkSize: 512,
      });

      const index = await VectorStoreIndex.fromVectorStore(pcvs);

      console.log('index', index);

      const resp = await index.deleteRefDoc(ref_doc_id);

      console.log(resp);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error deleting doc_id ${ref_doc_id} from vector db `,
          error.message
        );
      } else {
        console.error('Unexpected error', error);
      }
      throw error;
    }
  }

  async listAllChunksForDocument(source_id: string) {
    try {
      const ns = this.pc_index.namespace('buffers');
      const res = await ns.list({
        source_id: { $eq: source_id },
      });
      console.log(res);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error listing all chunks for source_id ${source_id} from vector db `,
          error.message
        );
      } else {
        console.error('Unexpected error', error);
      }
      throw error;
    }
  }

  async hardDeleteNameSpace(nameSpace: string) {
    try {
      await this.pc_index.namespace(nameSpace).deleteAll();
      console.log(`Deleted all records in namespace ${nameSpace}`);
    } catch (err) {
      throw err;
    }
  }
}

const transformAbsolutePath = async (
  path: string
): Promise<BaseNode<Metadata>[]> => {
  const documents = await loadDocuments([path]);
  // const parser = new SentenceSplitter();
  // const nodes = parser.getNodesFromDocuments(documents);
  const vectorStore = new PineconeVectorStore({
    indexName: 'sources',
    namespace: 'lama',
  });

  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({ chunkSize: 512, chunkOverlap: 20 }),
      new TitleExtractor(),
      new OpenAIEmbedding(),
      // new OffsetExtractor(),
      // new KeywordExtractor(),
    ],
    // vectorStore,
  });

  const nodes = await pipeline.run({ documents: [documents[0]] });

  console.log(nodes.length, 'added to vector store');

  return nodes;

  // let currentOffset = 0;
  // nodes.forEach((node, index) => {
  //   const start = currentOffset;
  //   currentOffset += node.text.length;
  //   const end = currentOffset;
  //   node.metadata['start'] = start;
  //   node.metadata['end'] = end;
  // });
  //
  // console.log(nodes.length);
  // return nodes;
};

// const transformBuffer = async (
//   buffer: Buffer<ArrayBufferLike>
// ): Promise<BaseNode<Metadata>[]> => {
//   console.log('bufferSize', buffer.byteLength);
//
//   const document = new Document({
//     text: buffer.toString('utf-8'),
//     id_: 'buffer',
//   });
//
//   const pipeline = new IngestionPipeline({
//     transformations: [
//       new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 20 }),
//       new OpenAIEmbedding(),
//     ],
//   });
//
//   return await pipeline.run({ documents: [document] });
// };

// const knowledgeIndex = new KnowledgeIndex('sources');
//
// knowledgeIndex.hardDeleteSource('936d92ec-b108-4f03-97b9-47332290a6e3');

// transformAbsolutePath('sam_altman_essay').then((nodes) => {
//   console.log(nodes);
// });

//TODO: create a PR for pineconeVB to geenrate vector id with prefix
export { KnowledgeIndex };
