import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  Document,
  Metadata,
  NodeWithScore,
  VectorStoreIndex,
} from 'llamaindex';

import { TextFileReader } from '@llamaindex/readers/text';

const STORAGE_DIRECTORY =
  '/home/jingyi/WebstormProjects/copilot-v2/public/uploads';
type VectorStoreResponseType = {
  response: string | null;
  sourceNodes: NodeWithScore<Metadata>[] | undefined;
};

const ensureDir = (path: string) => {
  mkdir(path, { recursive: true }, (err) => {
    if (err) console.error(`Error creating directory: ${path}`, err);
  });
};

const saveToFileSystem = async (buffer: Buffer, extension: string) => {
  try {
    const uploadDir = join(process.cwd(), `${STORAGE_DIRECTORY}`);
    ensureDir(uploadDir);

    const fileName = `${uuidv4()}.${extension}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (error) {
    console.log('error', error);
  }
};

const saveToBlobStorage = async () => {
  throw new Error(
    'Not Implemented: This function is a placeholder for storing in blob storage.'
  );
};

// const loadFileInToVectorStore = async (
//   file_id: string,
//   category: blobCategory
// ): Promise<VectorStoreResponseType> => {
//   try {
//     const filePath = join(`${STORAGE_DIRECTORY}/${file_id}.${category}`);
//
//     const essay = await fs.readFile(filePath, 'utf-8');
//     const document = new Document({ text: essay, id_: file_id });
//     const index = await VectorStoreIndex.fromDocuments([document]);
//     const queryEngine = index.asQueryEngine();
//     const { response, sourceNodes } = await queryEngine.query({
//       query: 'summarize the article',
//     });
//
//     return { response, sourceNodes };
//   } catch (error) {
//     console.error(error);
//     return { response: null, sourceNodes: [] };
//   }
// };

const loadDocuments = async (file_ids: string[]): Promise<Document[]> => {
  const reader = new TextFileReader();

  const documents: Document[] = [];

  for (const file_id of file_ids) {
    const tmp = await reader.loadData(`${STORAGE_DIRECTORY}/${file_id}.txt`);
    documents.push(...tmp);
  }

  return documents;
};

const chatWithFiles = async (
  query: string,
  file_ids: string[]
): Promise<VectorStoreResponseType> => {
  try {
    console.log('loading', file_ids);

    const documents = await loadDocuments(file_ids);

    const index = await VectorStoreIndex.fromDocuments(documents);
    const queryEngine = index.asQueryEngine();

    const { response, sourceNodes } = await queryEngine.query({
      query: query,
    });

    console.log(sourceNodes);

    return { response, sourceNodes };
  } catch (error) {
    console.log('error', error);
    return { response: null, sourceNodes: [] };
  }
};

export { saveToFileSystem, saveToBlobStorage, chatWithFiles, loadDocuments };
