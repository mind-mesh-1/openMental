import { describe, it, expect } from 'vitest';

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
