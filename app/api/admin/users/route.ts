import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { verifyToken } from '@/app/lib/auth';
import { Prisma } from '@prisma/client';

type UserWithSubscription = Prisma.UserGetPayload<{
  include: { subscription: true }
}>;

// Configuração do CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200, 
    headers: corsHeaders
  });
}

export async function GET(request: Request) {
  try {
    // Verificar token e permissão de admin
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }

    // Buscar todos os usuários com suas assinaturas
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remover senhas dos usuários antes de enviar
    const sanitizedUsers = users.map((user: UserWithSubscription) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(
      { users: sanitizedUsers },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
} 