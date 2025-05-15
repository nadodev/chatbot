import { NextResponse } from 'next/server';
import { SQLGenerator } from '@/app/lib/sql-generator';
import { SQLExecutor } from '@/app/lib/sql-executor';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders
  });
}

export async function POST(request: Request) {
  try {
    const { question, connectionString, schema } = await request.json();

    if (!question || !connectionString || !schema) {
      return NextResponse.json(
        { error: 'Pergunta, string de conexão e schema são obrigatórios' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Inicializa o gerador SQL
    const sqlGenerator = new SQLGenerator(process.env.OPENAI_API_KEY || '');
    sqlGenerator.setDatabaseSchema(schema);

    // Gera a consulta SQL
    const { sql, explanation, relevantTables } = await sqlGenerator.generateSQLQuery(question);

    // Se não for possível gerar SQL
    if (!sql) {
      return NextResponse.json({
        explanation,
        success: false,
        message: 'Não foi possível gerar uma consulta SQL para esta pergunta.'
      }, { headers: corsHeaders });
    }

    // Inicializa o executor de SQL
    const sqlExecutor = new SQLExecutor(connectionString);
    
    // Executa a consulta
    const { results, error } = await sqlExecutor.executeQuery(sql);
    
    // Fecha a conexão
    await sqlExecutor.disconnect();

    // Se houver erro na execução
    if (error) {
      return NextResponse.json({
        success: false,
        message: error,
        sql,
        explanation,
      }, { headers: corsHeaders });
    }

    // Retorna os resultados
    return NextResponse.json({
      success: true,
      results,
      sql,
      explanation,
      relevantTables,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Erro ao processar consulta SQL:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar consulta SQL', 
        message: error.message 
      },
      { status: 500, headers: corsHeaders }
    );
  }
} 