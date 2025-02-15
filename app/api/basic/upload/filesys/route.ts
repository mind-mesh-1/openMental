import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';

const STORAGE_DIRECTORY =
  '/home/jingyi/WebstormProjects/copilot-v2/public/uploads';

const saveToFileSystem = async (buffer: Buffer, extension: string) => {
  try {
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = join(STORAGE_DIRECTORY, fileName);
    await writeFile(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (error) {
    console.log('error', error);
  }
};

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
    const filePath = await saveToFileSystem(buffer, 'txt');

    return NextResponse.json(
      {
        message: ` uploaded successfully`,
        path: filePath,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};

export { POST };
