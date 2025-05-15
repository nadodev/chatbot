import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { existsSync } from 'fs';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders
  });
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Read file content
    const path = join(process.cwd(), 'uploads', filename);
    
    // Check if file exists
    if (!existsSync(path)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    let content;
    try {
      content = await readFile(path, 'utf-8');
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json(
        { error: 'Failed to read file content' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Use Google AI to extract relevant information
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Extract the most important information from this text and format it in a way that can be used as a knowledge base for a chat bot. Focus on key facts, definitions, and important details. Here's the text:
  
  ${content}`;
  
      const result = await model.generateContent(prompt);
      const processedContent = result.response.text();
  
      return NextResponse.json({
        filename,
        content: processedContent,
        processedAt: new Date().toISOString(),
      }, { headers: corsHeaders });
    } catch (aiError) {
      console.error('Error processing with AI:', aiError);
      // Fallback to using original content if AI processing fails
      return NextResponse.json({
        filename,
        content: content.slice(0, 5000) + (content.length > 5000 ? '...' : ''),
        processedAt: new Date().toISOString(),
        note: 'AI processing failed, returning truncated original content'
      }, { headers: corsHeaders });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500, headers: corsHeaders }
    );
  }
} 