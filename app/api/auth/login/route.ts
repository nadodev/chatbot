import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log('Tentativa de login:', { email }); // Debug

    // Validar dados
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário com sua assinatura
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    });

    console.log('Usuário encontrado:', user ? { 
      email: user.email, 
      role: user.role,
      hasSubscription: !!user.subscription 
    } : 'Não encontrado'); // Debug

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Gerar token JWT com role do usuário
    const token = sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remover senha do retorno e incluir informações importantes
    const { password: _, ...userWithoutPassword } = user;

    console.log('Login bem sucedido:', {
      email: user.email,
      role: user.role,
      subscription: user.subscription
    });

    const response = {
      user: {
        ...userWithoutPassword,
        subscription: user.subscription
      },
      token,
    };

    console.log('Resposta do login:', {
      userRole: response.user.role,
      hasToken: !!response.token
    }); // Debug

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
} 