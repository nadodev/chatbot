import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

// Função para obter as configurações
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Retornar configurações padrão se não existirem
      return NextResponse.json({
        aiProvider: 'google',
        googleApiKey: process.env.GOOGLE_API_KEY || '',
        openaiApiKey: process.env.OPENAI_API_KEY || '',
      });
    }

    return NextResponse.json({
      aiProvider: settings.aiProvider,
      googleApiKey: settings.googleApiKey || '',
      openaiApiKey: settings.openaiApiKey || '',
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

// Função para salvar as configurações
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aiProvider, googleApiKey, openaiApiKey } = body;

    // Validar os dados
    if (!aiProvider || (aiProvider !== 'google' && aiProvider !== 'openai')) {
      return NextResponse.json(
        { error: 'Provedor de IA inválido' },
        { status: 400 }
      );
    }

    // Atualizar ou criar configurações
    const settings = await prisma.settings.upsert({
      where: { id: 1 }, // Assumindo que sempre usaremos ID 1 para configurações globais
      update: {
        aiProvider,
        googleApiKey,
        openaiApiKey,
      },
      create: {
        id: 1,
        aiProvider,
        googleApiKey,
        openaiApiKey,
      },
    });

    // Atualizar variáveis de ambiente em memória
    if (aiProvider === 'google') {
      process.env.GOOGLE_API_KEY = googleApiKey;
    } else {
      process.env.OPENAI_API_KEY = openaiApiKey;
    }

    return NextResponse.json({
      aiProvider: settings.aiProvider,
      googleApiKey: settings.googleApiKey || '',
      openaiApiKey: settings.openaiApiKey || '',
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    );
  }
} 