import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const files = fs.readdirSync(uploadsDir);

    const sources = files.map((file) => {
      const fileType = path.extname(file).slice(1);
      return {
        id: path.parse(file).name,
        name: path.parse(file).name,
        fileType,
        isActive: false,
      };
    });

    return NextResponse.json({ sources }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}