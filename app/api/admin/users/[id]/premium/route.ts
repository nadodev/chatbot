import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { addDays } from 'date-fns';
import { verifyToken } from '@/app/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar token e permissão de admin
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { days } = await request.json();

    if (!days || days < 1) {
      return NextResponse.json(
        { error: 'Número de dias inválido' },
        { status: 400 }
      );
    }

    // Buscar usuário e sua assinatura
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar ou criar assinatura
    const currentDate = new Date();
    const baseDate = user.subscription?.endDate && user.subscription.endDate > currentDate
      ? user.subscription.endDate
      : currentDate;

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        endDate: addDays(baseDate, days),
        isActive: true,
      },
      create: {
        userId: user.id,
        startDate: currentDate,
        endDate: addDays(currentDate, days),
        isActive: true,
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Erro ao adicionar dias premium:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar assinatura' },
      { status: 500 }
    );
  }
} 