import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos os chats
export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar chats' },
      { status: 500 }
    );
  }
}

// POST - Criar novo chat
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, avatar, greeting, appearance, behavior } = body;

    if (!name || !greeting) {
      return NextResponse.json(
        { error: 'Nome e saudação são obrigatórios' },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.create({
      data: {
        name,
        avatar: avatar || '🤖',
        greeting,
        appearance: appearance ? JSON.stringify(appearance) : "{}",
        behavior: behavior ? JSON.stringify(behavior) : "{}"
      }
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao criar chat' },
      { status: 500 }
    );
  }
}

// PATCH /api/chats/:id - Update a chat
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { name, avatar, greeting, appearance, behavior, status } = data;

    const chat = await prisma.chat.update({
      where: { id },
      data: {
        name,
        avatar,
        greeting,
        status,
        appearance: appearance ? JSON.stringify(appearance) : undefined,
        behavior: behavior ? JSON.stringify(behavior) : undefined,
      }
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/:id - Delete a chat
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    await prisma.chat.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
} 