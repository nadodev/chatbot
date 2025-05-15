import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await prisma.chatConfig.findUnique({
      where: { chatId: params.id },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error fetching chat config:', error);
    return NextResponse.json(
      { error: 'Error fetching chat configuration' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Validar dados
    if (!data.aiProvider || !data.model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Atualizar ou criar configuração
    const config = await prisma.chatConfig.upsert({
      where: { chatId: params.id },
      update: {
        aiProvider: data.aiProvider,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
      },
      create: {
        chatId: params.id,
        aiProvider: data.aiProvider,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error updating chat config:', error);
    return NextResponse.json(
      { error: 'Error updating chat configuration' },
      { status: 500 }
    );
  }
} 