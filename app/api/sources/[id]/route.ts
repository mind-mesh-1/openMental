import { NextRequest, NextResponse } from 'next/server';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT buffer FROM uploads WHERE id = $1', [id]);
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      const content = rows[0].buffer.toString('utf-8');
      return NextResponse.json({ content });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file content' },
      { status: 500 }
    );
  }
}
