import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

type JsonString = string;

const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id: citationId } = await context.params;
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || 'your-api-key',
  });

  try {
    const vector = await client
      .Index('sources')
      .namespace('buffers')
      .fetch([citationId]);

    const nodeContent = JSON.parse(
      vector.records[citationId].metadata?._node_content as JsonString
    );

    return NextResponse.json({
      citationText: nodeContent['text'],
      sourceId: vector.records[citationId].metadata?.source_id,
      sourceName: vector.records[citationId].metadata?.source_name,
    });
  } catch (err) {
    console.error('Error in load directories', err);
    return undefined;
  }
};

export { GET };
