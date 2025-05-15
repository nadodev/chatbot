import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuração do CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200, 
    headers: corsHeaders
  });
}

// POST - Conectar ao banco de dados e listar os databases disponíveis
export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return new NextResponse(JSON.stringify({ error: 'URL do banco de dados não fornecida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Tentar conectar ao banco
    const connection = await mysql.createConnection(url);

    // Buscar lista de bancos de dados
    const [databases] = await connection.query('SHOW DATABASES');
    await connection.end();

    return new NextResponse(JSON.stringify({ databases }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    return new NextResponse(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro ao conectar ao banco de dados'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 