import { NextRequest, NextResponse } from 'next/server';
import { saveToFileSystem } from '@/lib/utils.server';

//TODO: type check to ensure only pdf and txt files are uploaded (BE)

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
    // const extension = contentType === 'application/pdf' ? 'pdf' : 'txt';
    const extension = 'pdf';
    const filePath = await saveToFileSystem(buffer, extension, extension);

    return NextResponse.json(
      {
        message: `${extension.toUpperCase()} uploaded successfully`,
        path: filePath,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};

export { POST };
