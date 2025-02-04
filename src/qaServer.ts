import express from 'express';
import cors from 'cors';
import { Document, VectorStoreIndex, serviceContextFromDefaults, OpenAIEmbedding, OpenAI } from "llamaindex";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 59919;

// Initialize LlamaIndex with OpenAI models
const embedModel = new OpenAIEmbedding({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-ada-002",
});

const llm = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-3.5-turbo",
  temperature: 0,
});

// Initialize LlamaIndex service context
const serviceContext = serviceContextFromDefaults({
  llm,
  embedModel,
});

// Function to read file content
const readFileContent = (sourceId: string): string => {
  const filePath = path.join(__dirname, '..', 'public', sourceId);
  return fs.readFileSync(filePath, 'utf-8');
};

// Function to create index from documents
const createIndexFromDocs = async (documents: Document[]) => {
  const index = await VectorStoreIndex.fromDocuments(documents, { serviceContext });
  return index;
};

app.post('/qa', async (req, res) => {
  try {
    const { sourceIds, question } = req.body;

    if (!Array.isArray(sourceIds) || !question) {
      return res.status(400).json({ error: 'Invalid request. Provide sourceIds array and question.' });
    }

    // Create documents from source files
    const documents = sourceIds.map(sourceId => {
      const content = readFileContent(sourceId);
      return new Document({ text: content });
    });

    // Create index and query engine
    const index = await createIndexFromDocs(documents);
    const queryEngine = index.asQueryEngine();

    // Get response
    const response = await queryEngine.query(question);

    res.json({
      answer: response.toString(),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});