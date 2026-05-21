import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractText, getDocumentProxy } from 'unpdf';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert uploaded file to Uint8Array (works natively in edge + Node runtimes)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load the PDF document via unpdf (uses bundled pdfjs-dist, no worker setup needed)
    const pdf = await getDocumentProxy(uint8Array);

    // Extract all page text and join them
    const { text } = await extractText(pdf, { mergePages: true });

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('PDF Parsing error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to parse PDF document' },
      { status: 500 }
    );
  }
}
