import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET() {
  try {
    // Buscar total de mensagens
    const totalMessages = await prisma.message.count();

    // Buscar chats ativos (que tiveram mensagens nas últimas 24h)
    const activeChats = await prisma.chat.count({
      where: {
        messages: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });

    // Calcular tempo médio de resposta (em segundos)
    const messages = await prisma.message.findMany({
      where: {
        role: 'assistant',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        }
      },
      select: {
        createdAt: true,
        chat: {
          select: {
            messages: {
              where: {
                role: 'user',
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              },
              select: {
                createdAt: true
              },
              take: 1
            }
          }
        }
      }
    });

    let totalResponseTime = 0;
    let validResponses = 0;

    messages.forEach(message => {
      const userMessage = message.chat.messages[0];
      if (userMessage) {
        const responseTime = message.createdAt.getTime() - userMessage.createdAt.getTime();
        totalResponseTime += responseTime / 1000; // Converter para segundos
        validResponses++;
      }
    });

    const averageResponseTime = validResponses > 0 
      ? Math.round(totalResponseTime / validResponses) 
      : 0;

    // Calcular satisfação dos usuários (simulado por enquanto)
    // TODO: Implementar sistema de feedback real
    const userSatisfaction = 95;

    return NextResponse.json({
      totalMessages,
      activeChats,
      averageResponseTime,
      userSatisfaction
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error fetching statistics' },
      { status: 500 }
    );
  }
} 