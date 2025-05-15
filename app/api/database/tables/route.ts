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

// GET - Listar tabelas de um banco de dados
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get('db');
    const url = searchParams.get('url');

    if (!dbName || !url) {
      return new NextResponse(JSON.stringify({ error: 'Parâmetros inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Conectar ao banco
    const connection = await mysql.createConnection(url);
    await connection.query(`USE ${dbName}`);

    // Buscar lista de tabelas
    const [result] = await connection.query('SHOW TABLES');
    await connection.end();

    // Transformar o resultado em um array de nomes de tabelas
    const tables = Array.isArray(result) 
      ? result.map(row => Object.values(row)[0]) 
      : [];

    return new NextResponse(JSON.stringify({ tables }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro ao buscar tabelas:', error);
    return new NextResponse(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro ao buscar tabelas do banco de dados'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 