import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeIndex } from '@/app/dao/knowledgeIndex';

interface QuerySourceNextRequest extends NextRequest {
  json: () => Promise<{ sourceIds: string[]; question: string }>;
}

export async function POST(req: QuerySourceNextRequest) {
  try {
    const data = await req.json();
    const { sourceIds, question } = data;

    console.log('sourceIds', sourceIds, question);

    // const { response } = await chatWithFiles(question, sourceIds);

    const idx = new KnowledgeIndex('sources');

    const response = await idx.queryDocuments(sourceIds, question);

    console.log(response);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
