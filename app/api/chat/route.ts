import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { messages, chatId } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];

    // Get chat sources if chatId is provided
    let sourcesContext = '';
    if (chatId) {
      const sources = await prisma.chatSource.findMany({
        where: {
          chatId,
        },
      });

      if (sources.length > 0) {
        sourcesContext = `Here is the relevant information from the chat's knowledge base:

${sources.map(source => `Source: ${source.name}
Content: ${source.content}`).join('\n\n')}

Please use this information to provide accurate and relevant responses.`;
      }
    }

    // Check if it's a product query
    const isProductQuery = lastMessage.content.toLowerCase().includes('produto') ||
      lastMessage.content.toLowerCase().includes('preço') ||
      lastMessage.content.toLowerCase().includes('price') ||
      lastMessage.content.toLowerCase().includes('list');

    if (isProductQuery) {
      const products = await prisma.products.findMany();
      const productsInfo = products.map(product => `
        Name: ${product.name}
        Description: ${product.description}
        Price: ${product.price}
        Stock: ${product.stock}
      `).join('\n');

      const prompt = `${sourcesContext}

Here are the available products:

${productsInfo}

Please answer the following question about our products: ${lastMessage.content}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return NextResponse.json({
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      });
    }

    // For general chat queries
    const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const prompt = `${sourcesContext}

Chat history:
${chatHistory}

Please provide a helpful response to the last message.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({
      id: Date.now().toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
