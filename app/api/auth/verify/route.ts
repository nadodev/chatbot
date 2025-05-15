import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';

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
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    return NextResponse.json({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return NextResponse.json(
      { error: 'Erro na verificação do token' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
} 