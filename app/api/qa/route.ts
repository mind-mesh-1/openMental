import { NextRequest, NextResponse } from 'next/server';
import { VectorIndex } from '@/lib/dao/vectorIndex';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { sourceIds, question } = data;

    // const { response } = await chatWithFiles(question, sourceIds);

    const response = new VectorIndex('sources').queryDocuments(
      sourceIds,
      question
    );

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
