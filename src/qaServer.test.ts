import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import dotenv from 'dotenv';

// Set up mock OpenAI API key for testing
beforeAll(() => {
  process.env.OPENAI_API_KEY = 'sk-mock-key-for-testing';
});

const API_URL = 'http://localhost:59919';

describe('QA Server Tests', () => {
  it('should answer questions about LlamaIndex from test1.txt', async () => {
    const response = await axios.post(`${API_URL}/qa`, {
      sourceIds: ['test1.txt'],
      question: 'What are the key features of LlamaIndex?'
    });

    expect(response.status).toBe(200);
    expect(response.data.answer).toBeDefined();
    expect(response.data.answer.toLowerCase()).toContain('data connectors');
    expect(response.data.answer.toLowerCase()).toContain('data indexes');
  });

  it('should answer questions about TypeScript from test2.txt', async () => {
    const response = await axios.post(`${API_URL}/qa`, {
      sourceIds: ['test2.txt'],
      question: 'What is TypeScript and what are its main features?'
    });

    expect(response.status).toBe(200);
    expect(response.data.answer).toBeDefined();
    expect(response.data.answer.toLowerCase()).toContain('microsoft');
    expect(response.data.answer.toLowerCase()).toContain('static typing');
  });

  it('should handle multiple source files', async () => {
    const response = await axios.post(`${API_URL}/qa`, {
      sourceIds: ['test1.txt', 'test2.txt'],
      question: 'What are the main features mentioned in both documents?'
    });

    expect(response.status).toBe(200);
    expect(response.data.answer).toBeDefined();
  });

  it('should handle invalid requests', async () => {
    try {
      await axios.post(`${API_URL}/qa`, {
        sourceIds: 'invalid',
        question: 'test question'
      });
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});