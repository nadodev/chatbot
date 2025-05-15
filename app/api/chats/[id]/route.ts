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

// GET - Buscar chat por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: params.id },
      include: {
        config: true
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat não encontrado' },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }

    return NextResponse.json(chat, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// PATCH - Atualizar chat
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existingChat = await prisma.chat.findUnique({
      where: { id: params.id },
      include: {
        config: true
      }
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: 'Chat não encontrado' },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }

    const body = await request.json();
    const { 
      name, 
      avatar, 
      greeting, 
      status, 
      appearance, 
      behavior, 
      dbConfig 
    } = body;

    const chat = await prisma.chat.update({
      where: { id: params.id },
      data: {
        name,
        avatar,
        greeting,
        status,
        appearance,
        behavior,
        dbConfig,
        config: {
          upsert: {
            create: {
              aiProvider: JSON.parse(behavior)?.aiProvider || 'google',
              model: JSON.parse(behavior)?.model || 'gemini-2.0-flash',
              temperature: JSON.parse(behavior)?.temperature || 0.7,
              maxTokens: JSON.parse(behavior)?.maxTokens || 150
            },
            update: {
              aiProvider: JSON.parse(behavior)?.aiProvider || 'google',
              model: JSON.parse(behavior)?.model || 'gemini-2.0-flash',
              temperature: JSON.parse(behavior)?.temperature || 0.7,
              maxTokens: JSON.parse(behavior)?.maxTokens || 150
            }
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
    console.error('Erro ao atualizar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar chat' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// DELETE - Deletar chat
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chat = await prisma.chat.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { success: true },
      { 
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Erro ao deletar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar chat' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
} 