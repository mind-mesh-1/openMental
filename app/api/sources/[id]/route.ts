import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
import pg from 'pg';
import { KnowledgeIndex } from '@/app/dao/knowledgeIndex';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     if (!id) {
//       return NextResponse.json(
//         { error: 'Source ID is required' },
//         { status: 400 }
//       );
//     }
//
//     const filePath = join(process.cwd(), 'public/uploads', `${id}.txt`);
//     const content = await fs.readFile(filePath, 'utf-8');
//     return NextResponse.json({ content });
//   } catch (error) {
//     console.error('Error retrieving file:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve file content' },
//       { status: 500 }
//     );
//   }
// }

const GET = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const client = await pool.connect();
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    const result = await client.query(
      'SELECT buffer FROM uploads WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const content = result.rows[0].buffer.toString('utf-8');

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file content' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
};

const DELETE = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const client = await pool.connect();

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    const knowledgeIndex = new KnowledgeIndex('sources');

    await knowledgeIndex.hardDeleteSource(id);

    const result = await client.query(
      'DELETE FROM uploads WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
};

export { GET, DELETE };
