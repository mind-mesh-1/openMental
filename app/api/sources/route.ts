import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
// export async function GET() {
//   try {
//     const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
//     const files = fs.readdirSync(uploadsDir);
//
//     const sources = files.map((file) => {
//       const fileType = path.extname(file).slice(1);
//       return {
//         id: path.parse(file).name,
//         name: path.parse(file).name,
//         fileType,
//         isActive: false,
//       };
//     });
//
//     return NextResponse.json({ sources }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch sources' },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id FROM uploads');
    const sources = result.rows.map((row: { id: string }) => ({
      id: row.id,
      name: row.id, // Mocking name as id
      fileType: 'txt', // Mocking fileType as 'txt'
      isActive: false, // Mocking isActive as false
    }));
    return NextResponse.json({ sources }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }
}
