import { NextRequest, NextResponse } from 'next/server'

const QA_API_URL = 'http://localhost:50564'  // FastAPI server URL

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { sourceId, question } = data

    const response = await fetch(`${QA_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_id: sourceId,
        question: question,
      }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 })
  }
}