import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadDocuments,
  loadFileInToVectorStore,
  saveToFileSystem,
} from '../utils.server';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs';

// Set up environment variables for testing
process.env.OPENAI_API_KEY = 'test-key';

describe('sanity test', () => {
  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should load environment variables', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });
});

describe('saveToFileSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save file successfully', async () => {
    const buffer = Buffer.from('test content');
    const category = 'txt';
    const extension = 'txt';

    const result = await saveToFileSystem(buffer, category, extension);

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(mkdir).toHaveBeenCalledTimes(1);
    expect(result).toMatch(/^\/uploads\/txt\/.+\.txt$/);
  });

  it('should handle errors gracefully', async () => {
    const buffer = Buffer.from('test content');
    const category = 'txt';
    const extension = 'txt';

    // Mock writeFile to throw an error
    const mockWriteFile = writeFile as jest.Mock;
    mockWriteFile.mockRejectedValueOnce(new Error('Write failed'));

    const result = await saveToFileSystem(buffer, category, extension);
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });
});

describe('llamaIndex on nextJS', () => {
  it('should load file from file system and qa', async () => {
    const { response, sourceNodes } = await loadFileInToVectorStore(
      'paul_graham_essay',
      'txt'
    );

    expect(response).toBeDefined();
    expect(sourceNodes).toBeDefined();
    expect(sourceNodes).toHaveLength(1);
    expect(sourceNodes[0]).toEqual({ score: 1, text: 'Test node' });
  }, 20000);

  it('loadDocument should return a document', async () => {
    const documents = await loadDocuments([
      'paul_graham_essay',
      'sam_altman_essay',
    ]);
    expect(documents).toHaveLength(2);
  });
});
