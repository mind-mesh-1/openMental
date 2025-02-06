import fs from 'fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'path';
import dotenv from 'dotenv';
import {
  PineconeVectorStore,
  SimpleDirectoryReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from 'llamaindex';
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

class indexController {
  private client: Pinecone;
  private pc_index: Index<RecordMetadata>;
  public constructor(indexName: string) {
    this.client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'your-api-key',
    });

    this.pc_index = this.client.Index(indexName);
  }

  public async loadDirectories(
    absoluteSourceDir: string
  ): Promise<VectorStoreIndex | undefined> {
    // const sourceDir = '/home/jingyi/WebstormProjects/copilot-v2/public/uploads';
    const fileList = await getSourceFilenames(absoluteSourceDir);
    const count = fileList.length;
    console.log(`Found ${count} files`);
    const fileName = '';
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
      console.error(fileName, err);
      return undefined;
    }
  }

  public async query(nameSpace: string, query: string) {
    const pcvs = new PineconeVectorStore({
      indexName: 'sources',
      namespace: nameSpace,
      chunkSize: 512,
    });
    const index = await VectorStoreIndex.fromVectorStore(pcvs);

    return index.asQueryEngine().query({ query });
  }

  public async purgeNamespace(nameSpace: string) {
    try {
      await this.pc_index.namespace(nameSpace).deleteAll();
      console.log(`Deleted all records in namespace ${nameSpace}`);
    } catch (err) {
      console.error(err);
    }
  }
}

export { indexController };
