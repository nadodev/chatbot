import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validar dados
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário com 7 dias de período premium
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscription: {
          create: {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            isActive: true,
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
} 