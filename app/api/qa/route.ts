import { NextResponse } from 'next/server';
import { KnowledgeIndex } from '@/app/dao/knowledgeIndex';
import { QueryRequest } from '@/app/api/request.type';

export async function POST(req: QueryRequest) {
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
