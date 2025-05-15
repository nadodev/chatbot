import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

interface SchemaData {
  [key: string]: {
    columns: RowDataPacket[];
    sampleData: RowDataPacket[];
  };
}

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

export async function POST(request: Request) {
  try {
    const { connectionString, tables } = await request.json();

    if (!connectionString) {
      return NextResponse.json(
        { message: 'String de conexão não fornecida' },
        { status: 400 }
      );
    }

    // Conectar ao banco
    const connection = await mysql.createConnection(connectionString);

    if (tables) {
      // Se tabelas específicas foram solicitadas, retornar schema delas
      const schema: SchemaData = {};
      for (const table of tables) {
        const [columns] = await connection.query<RowDataPacket[]>(`DESCRIBE ${table}`);
        const [sampleData] = await connection.query<RowDataPacket[]>(`SELECT * FROM ${table} LIMIT 3`);
        
        schema[table] = {
          columns,
          sampleData
        };
      }
      
      await connection.end();
      return NextResponse.json({ schema });
    } else {
      // Se não foram especificadas tabelas, retornar lista de tabelas
      const [result] = await connection.query<RowDataPacket[]>('SHOW TABLES');
      await connection.end();

      const tables = result.map(row => Object.values(row)[0] as string);

      return NextResponse.json({ tables });
    }
  } catch (error) {
    console.error('Erro ao processar banco de dados:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro ao processar banco de dados' },
      { status: 500 }
    );
  }
}

// Helper function to extract specific examples from each column for better context
function extractValueExamples(columns: any[], sampleData: any[]) {
  if (!sampleData || sampleData.length === 0) {
    return {};
  }
  
  const examples: {[column: string]: string[]} = {};
  
  // Loop through columns to get value examples
  for (const col of columns) {
    const columnName = col.Field;
    if (!columnName) continue;
    
    // Extract unique values for this column
    const uniqueValues = new Set();
    
    for (const row of sampleData) {
      if (row[columnName] !== null && row[columnName] !== undefined) {
        // Only add if not already in the set and we have fewer than 5 examples
        if (uniqueValues.size < 5) {
          uniqueValues.add(String(row[columnName]));
        }
      }
    }
    
    // Convert set to array
    examples[columnName] = Array.from(uniqueValues) as string[];
  }
  
  return examples;
}

// Helper function to generate semantic metadata about tables
function generateMetadata(tableName: string, columns: any[], sampleData: any[]) {
  // Normalize table name to help with semantic matching
  const normalizedTableName = tableName.toLowerCase();
  
  // Find common entity types based on table name
  const entityMappings: {[key: string]: string[]} = {
    'products': ['produto', 'item', 'mercadoria', 'artigo'],
    'users': ['usuário', 'cliente', 'pessoa', 'membro'],
    'customers': ['cliente', 'comprador', 'consumidor'],
    'orders': ['pedido', 'compra', 'encomenda'],
    'faq': ['pergunta', 'questão', 'dúvida', 'perguntas frequentes'],
    'questions': ['pergunta', 'questão', 'dúvida'],
    'categories': ['categoria', 'classificação', 'tipo'],
    'messages': ['mensagem', 'comunicação', 'conversa'],
    'chat': ['conversa', 'diálogo', 'bate-papo'],
    'posts': ['publicação', 'artigo', 'postagem'],
  };
  
  // Determine possible entity name
  let possibleEntityName = '';
  let semanticKeywords: string[] = [];
  
  // Check if table name matches any known entity type
  Object.entries(entityMappings).forEach(([entity, keywords]) => {
    if (normalizedTableName.includes(entity) || keywords.some(k => normalizedTableName.includes(k))) {
      possibleEntityName = entity;
      semanticKeywords = [...semanticKeywords, ...keywords];
    }
  });
  
  // If no match, use the table name as is
  if (!possibleEntityName) {
    possibleEntityName = tableName;
  }
  
  // Generate common queries based on entity type and columns
  const commonQueries: string[] = [];
  
  // Common query patterns
  commonQueries.push(`listar todos os ${possibleEntityName}`);
  commonQueries.push(`mostrar ${possibleEntityName}`);
  
  // Check for specific columns to generate more targeted queries
  const hasName = columns.some(col => ['name', 'nome', 'title', 'titulo'].includes(col.Field?.toLowerCase()));
  const hasPrice = columns.some(col => ['price', 'preco', 'valor'].includes(col.Field?.toLowerCase()));
  const hasCategory = columns.some(col => ['category', 'categoria', 'type', 'tipo'].includes(col.Field?.toLowerCase()));
  const hasDate = columns.some(col => ['date', 'data', 'createdAt', 'created_at'].includes(col.Field?.toLowerCase()));
  const hasQuestion = columns.some(col => ['question', 'pergunta', 'query'].includes(col.Field?.toLowerCase()));
  const hasAnswer = columns.some(col => ['answer', 'resposta', 'reply'].includes(col.Field?.toLowerCase()));
  
  if (hasName) {
    commonQueries.push(`encontrar ${possibleEntityName} por nome`);
  }
  
  if (hasPrice) {
    commonQueries.push(`${possibleEntityName} por preço`);
    commonQueries.push(`${possibleEntityName} mais baratos`);
    commonQueries.push(`${possibleEntityName} mais caros`);
  }
  
  if (hasCategory) {
    commonQueries.push(`${possibleEntityName} por categoria`);
    commonQueries.push(`categorias de ${possibleEntityName}`);
  }
  
  if (hasDate) {
    commonQueries.push(`${possibleEntityName} mais recentes`);
    commonQueries.push(`${possibleEntityName} por data`);
  }
  
  if (hasQuestion && hasAnswer) {
    commonQueries.push(`listar perguntas`);
    commonQueries.push(`mostrar perguntas frequentes`);
    commonQueries.push(`tirar dúvidas`);
  }
  
  return {
    possibleEntityName,
    semanticKeywords,
    commonQueries
  };
} 