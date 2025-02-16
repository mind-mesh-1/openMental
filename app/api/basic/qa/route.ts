import { NextResponse } from 'next/server';
import { KnowledgeIndex } from '@/app/dao/knowledgeIndex';
import { QueryRequest } from '@/app/api/basic/request.type';

export async function POST(req: QueryRequest) {
  try {
    const data = await req.json();
    const { sourceIds, question } = data;
    // const { response } = await chatWithFiles(question, sourceIds);

    const idx = new KnowledgeIndex('sources');

    const engineResponse = await idx.queryDocuments(sourceIds, question);

    const resp = {
      answer: engineResponse.response,
      citations: engineResponse.sourceNodes?.map((nodeWithScore) => ({
        citationId: nodeWithScore.node.id_,
        score: nodeWithScore.score,
        sourceId: nodeWithScore.node.metadata.source_id,
      })),
    };

    return NextResponse.json(resp);
  } catch {
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
