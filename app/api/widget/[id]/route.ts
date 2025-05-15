import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Widget solicitado para o chat ID: ${params.id}`);
    
    // Buscar as configurações do chat diretamente pelo Prisma
    const chat = await prisma.chat.findUnique({
      where: { id: params.id },
    });

    if (!chat) {
      console.log(`Chat não encontrado: ${params.id}`);
      return new NextResponse('Chat não encontrado', { status: 404 });
    }

    console.log(`Chat encontrado: ${chat.name}`);

    // Tratamento seguro para os objetos JSON
    let appearance = {};
    let behavior = {};
    let dbConfig = {};

    try {
      if (chat.appearance) {
        appearance = typeof chat.appearance === 'string' 
          ? JSON.parse(chat.appearance)
          : chat.appearance;
      }
    } catch (e) {
      console.error("Erro ao parsear appearance:", e);
    }

    try {
      if (chat.behavior) {
        behavior = typeof chat.behavior === 'string'
          ? JSON.parse(chat.behavior)
          : chat.behavior;
      }
    } catch (e) {
      console.error("Erro ao parsear behavior:", e);
    }

    try {
      if (chat.dbConfig) {
        dbConfig = typeof chat.dbConfig === 'string'
          ? JSON.parse(chat.dbConfig)
          : chat.dbConfig;
      }
    } catch (e) {
      console.error("Erro ao parsear dbConfig:", e);
    }

    // Gerar o código do widget
    const widgetCode = `
      (function() {
        const widgetContainer = document.getElementById('chat-widget-container');
        if (!widgetContainer) return;

        const chatConfig = ${JSON.stringify({
          id: params.id,
          name: chat.name || "Chat",
          avatar: chat.avatar || "🤖",
          greeting: chat.greeting || "Olá! Como posso ajudar?",
          appearance,
          behavior,
          dbConfig
        })};

        // Criar o iframe do chat
        const iframe = document.createElement('iframe');
        iframe.src = '${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/chat/${params.id}';
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

        // Adicionar o iframe ao container
        widgetContainer.appendChild(iframe);

        // Configurar o estilo do container
        widgetContainer.style.position = 'fixed';
        widgetContainer.style.bottom = '20px';
        widgetContainer.style.right = '20px';
        widgetContainer.style.width = '350px';
        widgetContainer.style.height = '600px';
        widgetContainer.style.zIndex = '9999';
      })();
    `;

    console.log("Widget gerado com sucesso");
    
    return new NextResponse(widgetCode, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar widget:', error);
    return NextResponse.json(
      { message: 'Erro ao gerar widget', error: String(error) },
      { status: 500 }
    );
  }
}