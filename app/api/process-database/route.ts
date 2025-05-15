import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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

interface SchemaData {
  [tableName: string]: {
    columns: any[];
    sampleData: any[];
    metadata: {
      possibleEntityName: string;
      semanticKeywords: string[];
      commonQueries: string[];
    };
    valueExamples?: {[column: string]: string[]};
  };
}

export async function POST(request: Request) {
  try {
    const { connectionString, tables } = await request.json();

    if (!connectionString) {
      return NextResponse.json(
        { error: 'No connection string provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      // Create a connection
      const connection = await mysql.createConnection(connectionString);

      // If tables parameter is provided, get schema and sample data for those tables
      if (tables && tables.length > 0) {
        const schema: SchemaData = {};
        
        for (const tableName of tables) {
          // Get columns
          const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
          
          // Get sample data (limited to 10 rows)
          const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 10`);
          
          // Extract specific data examples for better prompt context
          const valueExamples = extractValueExamples(columns as any[], rows as any[]);
          
          // Generate semantic metadata to help AI understand this table
          const metadata = generateMetadata(tableName, columns as any[], rows as any[]);
          
          schema[tableName] = {
            columns: columns as any[],
            sampleData: rows as any[],
            metadata,
            valueExamples
          };
        }
        
        await connection.end();
        
        return NextResponse.json({
          schema,
          processedAt: new Date().toISOString(),
        }, { headers: corsHeaders });
      } 
      // Otherwise just list the available tables
      else {
        // Get list of tables
        const [tablesResult] = await connection.query('SHOW TABLES');
        const tableList = [];
        
        for (const tableRow of Object.values(tablesResult as object[])) {
          const tableName = Object.values(tableRow as object)[0] as string;
          
          // Get columns for this table
          const [columnsResult] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
          
          tableList.push({
            name: tableName,
            columns: columnsResult as any[]
          });
        }
        
        await connection.end();
        
        return NextResponse.json({
          tables: tableList,
          processedAt: new Date().toISOString(),
        }, { headers: corsHeaders });
      }
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: `Database connection error: ${dbError.message}` },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Error processing database request:', error);
    return NextResponse.json(
      { error: 'Failed to process database request' },
      { status: 500, headers: corsHeaders }
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