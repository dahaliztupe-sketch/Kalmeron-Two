import { NextResponse } from 'next/server';
const pdf = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text });
  } catch (error) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: error }, 'PDF Extraction Error');
    return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 });
  }
}
