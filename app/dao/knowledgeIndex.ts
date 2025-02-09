import fs from 'fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'path';
import dotenv from 'dotenv';
import {
  Document,
  storageContextFromDefaults,
  VectorStoreIndex,
  OpenAI,
  OpenAIEmbedding,
  MetadataFilters,
} from 'llamaindex';

import { Settings } from '@llamaindex/core/global';

Settings.llm = new OpenAI();
Settings.embedModel = new OpenAIEmbedding({
  model: 'text-embedding-3-small',
  dimensions: 1536,
});
import { PineconeVectorStore } from '@llamaindex/pinecone';
import { SimpleDirectoryReader } from '@llamaindex/readers/directory';
import { Index, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Load environment variables from a specific .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
    sourceId: string,
    buffer: Buffer<ArrayBufferLike>
  ): Promise<VectorStoreIndex | undefined> {
    try {
      const document = new Document({
        text: buffer.toString('utf-8'),
        metadata: {
          source_id: sourceId,
        },
      });

      const pcvs = new PineconeVectorStore({
        indexName: 'sources',
        namespace: 'buffers',
        chunkSize: 512,
      });

      const ctx = await storageContextFromDefaults({ vectorStore: pcvs });

      return await VectorStoreIndex.fromDocuments([document], {
        storageContext: ctx,
      });
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

  async queryDocuments(documentIds: string[], query: string) {
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
      similarityTopK: 5,
      // retriever: index.asRetriever({ mode: SummaryRetrieverMode.LLM }),
    });

    return queryEngine.query({ query: 'summarize the article' });
  }

  async hardDeleteSource(source_id: string) {
    try {
      await this.pc_index.deleteMany({
        source_id: { $eq: source_id },
      });
    } catch (error) {
      console.error('Error deleting source:', error);
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

export { KnowledgeIndex };
