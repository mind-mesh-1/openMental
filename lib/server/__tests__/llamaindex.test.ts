import { describe, it, expect } from 'vitest';
import { loadFileInToVectorStore } from '../utils.server';

console.log('GGGGGG');

describe('sanity test', () => {
  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should load environment variables', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });
});

describe('llamaIndex on nextJS', () => {
  it('should load file from file system and qa', async () => {
    const { response, sourceNodes } = await loadFileInToVectorStore(
      'paul_graham_essay',
      'txt'
    );

    expect(response).toBeDefined();
    expect(sourceNodes?.length).toBeGreaterThan(0);
    console.log('response', response, sourceNodes);
  }, 20000);
});
