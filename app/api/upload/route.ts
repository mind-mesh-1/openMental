import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';
import { KnowledgeIndex } from '@/app/dao/knowledgeIndex';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const STORAGE_DIRECTORY =
  '/home/jingyi/WebstormProjects/copilot-v2/public/uploads';

const saveToFileSystem = async (buffer: Buffer, extension: string) => {
  try {
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = join(STORAGE_DIRECTORY, fileName);
    await writeFile(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (error) {
    console.log('Error saving to file system', error);
    return null;
  }
};

const POST = async (req: NextRequest) => {
  try {
    const buffer = Buffer.from(await req.arrayBuffer());

    const filePath = await saveToFileSystem(buffer, 'txt');

    const source_id = uuidv4();
    const filename = filePath?.split('/').pop();
    const contentType = 'text/plain';
    const size = buffer.length;
    const uploadedAt = new Date();

    console.log('id', source_id, uploadedAt, buffer.length);

    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO uploads (id, filename, content_type, size, uploaded_at, metadata, buffer) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          source_id,
          filename,
          contentType,
          size,
          uploadedAt,
          JSON.stringify({}),
          buffer,
        ]
      );

      console.log('upload to psql complete');

      const idx = new KnowledgeIndex('sources');
      const resp = await idx.uploadToPineCone(source_id, buffer);

      console.log('upload to pinecone complete', resp);

      return NextResponse.json(
        {
          message: 'File uploaded successfully',
          path: filePath,
        },
        { status: 200 }
      );
    } catch (error) {
      console.log('error saving to database', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};

export { POST };
