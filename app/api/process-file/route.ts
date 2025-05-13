import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    // Read file content
    const path = join(process.cwd(), 'uploads', filename);
    const content = await readFile(path, 'utf-8');

    // Use Google AI to extract relevant information
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Extract the most important information from this text and format it in a way that can be used as a knowledge base for a chat bot. Focus on key facts, definitions, and important details. Here's the text:

${content}`;

    const result = await model.generateContent(prompt);
    const processedContent = result.response.text();

    return NextResponse.json({
      filename,
      content: processedContent,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
} 