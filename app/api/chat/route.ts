import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getProductResponse } from "@/app/lib/db";

// Create a Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    // Get the last user message
    const lastUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .pop()?.content;

    if (!lastUserMessage) {
      throw new Error("No user message found");
    }

    // Check if the message is about products
    const isProductQuery = lastUserMessage.toLowerCase().includes('product') ||
                          lastUserMessage.toLowerCase().includes('produto') ||
                          lastUserMessage.toLowerCase().includes('preço') ||
                          lastUserMessage.toLowerCase().includes('price') ||
                          lastUserMessage.toLowerCase().includes('list') ||
                          lastUserMessage.toLowerCase().includes('lista');

    let responseText;

    if (isProductQuery) {
      // Use LangChain to get product information
      responseText = await getProductResponse(lastUserMessage);
    } else {
      // Use Google AI for general chat
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Prepare the chat history
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Start chat with history
      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Generate response
      const result = await chat.sendMessage(lastUserMessage);
      const response = await result.response;
      responseText = response.text();
    }

    if (!responseText) {
      throw new Error("No response from AI model");
    }

    // Return a simple JSON response
    return NextResponse.json({
      id: Date.now().toString(),
      role: 'assistant',
      content: responseText,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
