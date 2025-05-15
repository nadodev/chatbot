import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar as configurações do chat
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chats/${params.id}`);
    const chat = await response.json();

    if (!response.ok) {
      throw new Error('Chat não encontrado');
    }

    // Gerar o código do widget
    const widgetCode = `
      (function() {
        const widgetContainer = document.getElementById('chat-widget-container');
        if (!widgetContainer) return;

        const chatConfig = ${JSON.stringify({
          id: params.id,
          name: chat.name,
          avatar: chat.avatar,
          greeting: chat.greeting,
          appearance: JSON.parse(chat.appearance),
          behavior: JSON.parse(chat.behavior),
          dbConfig: JSON.parse(chat.dbConfig)
        })};

        // Criar o iframe do chat
        const iframe = document.createElement('iframe');
        iframe.src = '${process.env.NEXT_PUBLIC_APP_URL}/chat/${params.id}';
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

    return new NextResponse(widgetCode, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar widget:', error);
    return NextResponse.json(
      { message: 'Erro ao gerar widget' },
      { status: 500 }
    );
  }
}