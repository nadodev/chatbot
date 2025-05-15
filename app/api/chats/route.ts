import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

// Configuração do CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200, 
    headers: corsHeaders
  });
}

// GET - Listar todos os chats
export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      include: {
        config: true
      }
    });

    return NextResponse.json(chats, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Erro ao listar chats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// POST - Criar novo chat
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      avatar, 
      greeting, 
      status = 'active',
      appearance, 
      behavior, 
      dbConfig 
    } = body;

    const chat = await prisma.chat.create({
      data: {
        name,
        avatar,
        greeting,
        status,
        appearance: appearance || {},
        behavior: behavior || {},
        dbConfig: dbConfig || {},
        config: {
          create: {
            aiProvider: behavior?.aiProvider || 'google',
            model: behavior?.model || 'gemini-2.0-flash',
            temperature: behavior?.temperature || 0.7,
            maxTokens: behavior?.maxTokens || 150
          }
        }
      },
      include: {
        config: true
      }
    });

    return NextResponse.json(chat, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao criar chat' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// PATCH - Atualizar um chat
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'ID do chat é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const existingChat = await prisma.chat.findUnique({
      where: { id }
    });

    if (!existingChat) {
      return new NextResponse(JSON.stringify({ error: 'Chat não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const data = await request.json();
    const chat = await prisma.chat.update({
      where: { id },
      data: {
        name: data.name,
        avatar: data.avatar,
        greeting: data.greeting,
        status: data.status,
        appearance: data.appearance ? JSON.stringify(data.appearance) : undefined,
        behavior: data.behavior ? JSON.stringify(data.behavior) : undefined,
        dbConfig: data.dbConfig ? JSON.stringify(data.dbConfig) : undefined
      }
    });

    return new NextResponse(JSON.stringify(chat), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Erro ao atualizar chat:', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// DELETE - Excluir um chat
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'ID do chat é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    await prisma.chat.delete({
      where: { id }
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Erro ao excluir chat:', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
} 