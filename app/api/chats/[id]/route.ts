import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import prisma from '@/app/lib/db';

const prismaClient = new PrismaClient();

// GET - Buscar chat por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: params.id },
      include: {
        sources: true,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar chat
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, avatar, greeting, status, appearance, behavior } = body;

    const chat = await prismaClient.chat.update({
      where: { id: params.id },
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
    console.error('Erro ao atualizar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar chat' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar chat
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prismaClient.chat.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar chat' },
      { status: 500 }
    );
  }
} 