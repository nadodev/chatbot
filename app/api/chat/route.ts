import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { verifyToken, checkPremiumStatus } from '@/app/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chat, ChatSource, Message } from '@prisma/client';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permitir de qualquer origem para o widget
  'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// Define the expected chat data structure with sources and messages
interface ChatWithRelations extends Chat {
  sources: ChatSource[];
  messages: Message[];
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200,
    headers: corsHeaders
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, message, config } = body;

    // Verifica se o chat existe e está ativo
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        sources: true,
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 10
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat não encontrado' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Preparar o contexto do chat
    const conversationHistory = chat.messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // Preparar o contexto das fontes
    let sourcesContext = '';
    for (const source of chat.sources) {
      sourcesContext += `${source.content}\n\n`;
    }

    // Gerar prompt para o modelo
    const prompt = `
      Você é um assistente útil para uma empresa. Use as informações a seguir para fornecer respostas precisas e úteis:
      
      Configuração do Chat:
      Nome: ${chat.name}
      Saudação: ${chat.greeting || 'Olá! Como posso ajudar?'}
      
      Base de Conhecimento:
      ${sourcesContext}
      
      Conversa Recente:
      ${conversationHistory}
      
      Nova mensagem do usuário: ${message}
      
      Por favor, forneça uma resposta útil e relevante com base no contexto e no histórico da conversa.
      Mantenha a resposta concisa e focada na pergunta do usuário.
    `;

    // Gerar resposta usando o modelo
    const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent(prompt);
    const response = result.response.text();

    if (!response) {
      throw new Error("Sem resposta do modelo de IA");
    }

    // Salvar mensagens no banco de dados
    await prisma.message.create({
      data: {
        chatId: chatId,
        content: message,
        role: 'user',
      },
    });

    await prisma.message.create({
      data: {
        chatId: chatId,
        content: response,
        role: 'assistant',
      },
    });

    return NextResponse.json({ response }, { headers: corsHeaders });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Função auxiliar para verificar se a mensagem parece ser uma pergunta sobre dados
function containsDatabaseQuestion(message: string): boolean {
  const dbKeywords = [
    'listar', 'mostrar', 'exibir', 'quais', 'quantos', 'quanto', 'onde', 'quando',
    'lista', 'buscar', 'encontrar', 'procurar', 'obter', 'selecionar',
    'produtos', 'categorias', 'preço', 'valor', 'data', 'cliente', 'pedido',
    'perguntas', 'respostas', 'dúvidas', 'faq'
  ];
  
  const messageLower = message.toLowerCase();
  
  return dbKeywords.some(keyword => messageLower.includes(keyword));
}

// Função para obter o URL base
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`;
}
