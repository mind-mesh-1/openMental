import { NextRequest, NextResponse } from 'next/server';
import { VectorIndex } from '@/lib/dao/vectorIndex';

const POST = async (req: NextRequest) => {
  try {
    // const contentType = req.headers.get('content-type');
    // if (
    //   !contentType ||
    //   !['application/pdf', 'text/plain'].includes(contentType)
    // ) {
    //   return NextResponse.json(
    //     { error: 'Unsupported file type. Only PDF and TXT files are allowed.' },
    //     { status: 400 }
    //   );
    // }

    const buffer = Buffer.from(await req.arrayBuffer());
    const idx = new VectorIndex('sources');

    await idx.uploadToPineCone(buffer);

    return NextResponse.json(
      {
        message: `uploaded successfully`,
        path: 'pinecone-sources-buffer',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};

export { POST };
