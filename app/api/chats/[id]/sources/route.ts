import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all sources for a chat
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sources = await prisma.chatSource.findMany({
      where: {
        chatId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// Add a new source to a chat
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type, name, content } = await request.json();

    if (!type || !name || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const source = await prisma.chatSource.create({
      data: {
        chatId: params.id,
        type,
        name,
        content,
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error('Error adding source:', error);
    return NextResponse.json(
      { error: 'Failed to add source' },
      { status: 500 }
    );
  }
}

// Delete a source from a chat
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
      return NextResponse.json(
        { error: 'No source ID provided' },
        { status: 400 }
      );
    }

    await prisma.chatSource.delete({
      where: {
        id: sourceId,
        chatId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    );
  }
} 