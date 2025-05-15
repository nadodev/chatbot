import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './app/lib/auth';

// Configuração do CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function middleware(request: NextRequest) {
  // Permitir acesso a rotas públicas e páginas da interface
  if (
    !request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname.startsWith('/api/auth/register') ||
    request.nextUrl.pathname.startsWith('/api/auth/verify') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Verificar token de autenticação
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Token não fornecido' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  }

  try {
    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ error: 'Token inválido' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }

    // Verificação adicional para rotas administrativas
    if (request.nextUrl.pathname.startsWith('/api/admin') && decoded.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Acesso não autorizado - Apenas administradores' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        }
      );
    }

    const response = NextResponse.next();
    
    // Adicionar headers CORS
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Erro na autenticação' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 