import { NextRequest } from 'next/server';

type QueryRequest = NextRequest & {
  json: () => Promise<{ sourceIds: string[]; question: string }>;
};

export { type QueryRequest };
