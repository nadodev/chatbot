import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch URL content
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch URL content' },
        { status: 400, headers: corsHeaders }
      );
    }

    const text = await response.text();

    // Use Google AI to extract relevant information
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Extract the most important information from this text and format it in a way that can be used as a knowledge base for a chat bot. Focus on key facts, definitions, and important details. Here's the text:

${text}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    return NextResponse.json({
      url,
      content,
      processedAt: new Date().toISOString(),
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json(
      { error: 'Failed to process URL' },
      { status: 500, headers: corsHeaders }
    );
  }
} 