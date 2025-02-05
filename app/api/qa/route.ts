import { NextRequest, NextResponse } from 'next/server';
import { chatWithFiles } from '@/lib/utils.server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { sourceIds, question } = data;

    const { response } = await chatWithFiles(question, sourceIds);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
