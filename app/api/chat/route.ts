import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { verifyToken, checkPremiumStatus } from '@/app/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chat, ChatSource, Message } from '@prisma/client';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
  'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// Define the expected chat data structure with sources and messages
interface ChatWithRelations extends Chat {
  sources: ChatSource[];
  messages: Message[];
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200,
    headers: corsHeaders
  });
}

export async function POST(request: Request) {
  try {
    // Verificar token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401, headers: corsHeaders }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verificar status premium
    const isPremium = await checkPremiumStatus(decoded.userId);
    if (!isPremium) {
      return NextResponse.json(
        { error: 'Acesso disponível apenas para usuários premium' },
        { status: 403, headers: corsHeaders }
      );
    }

    const { chatId, message } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Chat ID e mensagem são obrigatórios' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verificar se o chat pertence ao usuário
    const chat = await prisma.chat.findFirst({
      where: { 
        id: chatId,
        userId: decoded.userId
      },
      include: {
        sources: true,
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 10
        },
        config: true
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat não encontrado ou acesso não autorizado' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if chat is paused
    if (chat.status === 'paused') {
      return NextResponse.json(
        { error: 'Chat is currently paused' },
        { status: 403, headers: corsHeaders }
      );
    }

    // Salvar mensagem do usuário
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        chatId,
      },
    });

    // Prepare context from sources
    let sourcesContext = '';
    let databaseSchemas = {};
    let hasDatabaseSource = false;
    let connectionString = '';
    
    for (const source of chat.sources) {
      if (source.type === 'database') {
        try {
          // For database sources, parse the stored JSON schema
          const dbData = JSON.parse(source.content);
          
          // Save for potential SQL generation later
          databaseSchemas = dbData;
          hasDatabaseSource = true;
          
          // Try to extract connection string from source name
          const connectionMatch = source.name.match(/Database: (.*?) \(/);
          if (connectionMatch && connectionMatch[1]) {
            connectionString = connectionMatch[1];
          }
          
          let dbContext = `DATABASE SOURCE: ${source.name}\n\n`;
          
          // Build context with table schema and sample data
          for (const [tableName, tableData] of Object.entries(dbData)) {
            const table = tableData as { 
              columns: any[], 
              sampleData: any[],
              metadata?: {
                possibleEntityName: string;
                semanticKeywords: string[];
                commonQueries: string[];
              },
              valueExamples?: Record<string, string[]>
            };
            
            // Add table schema with more contextual information
            dbContext += `Tabela: ${tableName}\n`;
            
            // Add metadata if available
            if (table.metadata) {
              dbContext += `Este é um conjunto de dados que representa: ${table.metadata.possibleEntityName}\n`;
              dbContext += `Palavras-chave relacionadas: ${table.metadata.semanticKeywords.join(', ')}\n`;
              dbContext += `Consultas comuns: ${table.metadata.commonQueries.join(', ')}\n`;
            }
            
            // Add columns with detailed info
            dbContext += `Colunas: \n`;
            if (table.columns && table.columns.length > 0) {
              table.columns.forEach(col => {
                dbContext += `- ${col.Field} (${col.Type}) ${col.Key === 'PRI' ? '(CHAVE PRIMÁRIA)' : ''}\n`;
                
                // Add specific value examples for this column if available
                if (table.valueExamples && table.valueExamples[col.Field] && table.valueExamples[col.Field].length > 0) {
                  dbContext += `  Exemplos de valores: ${table.valueExamples[col.Field].join(', ')}\n`;
                }
              });
            }
            
            // Add sample data if available
            if (table.sampleData && table.sampleData.length > 0) {
              dbContext += "\nDados de amostra:\n";
              const sampleDataStr = JSON.stringify(table.sampleData.slice(0, 3), null, 2);
              dbContext += `${sampleDataStr}\n\n`;
            }
          }
          
          sourcesContext += dbContext;
        } catch (error) {
          console.error('Error parsing database source:', error);
          sourcesContext += `Source: ${source.name} (Error: Could not parse database schema)\n`;
        }
      } else {
        // Handle regular text sources
        sourcesContext += `Source: ${source.name}\nContent: ${source.content}\n\n`;
      }
    }

    // Prepare conversation history
    const conversationHistory = chat.messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    // Try to use SQL generation if this is a database question and we have connection info
    let sqlResults = null;
    if (hasDatabaseSource && connectionString && containsDatabaseQuestion(message)) {
      try {
        const sqlQueryResponse = await fetch(`${getBaseUrl()}/api/sql-query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: message,
            connectionString,
            schema: databaseSchemas
          }),
        });
        
        if (sqlQueryResponse.ok) {
          const data = await sqlQueryResponse.json();
          if (data.success) {
            sqlResults = data;
          }
        }
      } catch (error) {
        console.error('Error calling SQL query API:', error);
        // Continue without SQL results
      }
    }

    // Initialize AI model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Add SQL results to the prompt if available
    let sqlContext = "";
    if (sqlResults) {
      sqlContext = `
      Dados obtidos diretamente do banco de dados para a pergunta do usuário:
      
      Consulta SQL gerada: ${sqlResults.sql}
      
      Explicação da consulta: ${sqlResults.explanation}
      
      Resultados obtidos:
      ${JSON.stringify(sqlResults.results, null, 2)}
      
      Use esses resultados diretos para responder à pergunta do usuário.
      Não mencione que você gerou SQL, apenas responda com os dados que você tem.
      `;
    }

    // Create prompt with context and conversation history
    const prompt = `
      Você é um assistente útil para uma empresa. Use as informações a seguir para fornecer respostas precisas e úteis:
      
      Configuração do Chat:
      Nome: ${chat.name}
      Saudação: ${chat.greeting}
      
      Base de Conhecimento:
      ${sourcesContext}
      
      Conversa Recente:
      ${conversationHistory}
      
      ${sqlContext}
      
      Nova mensagem do usuário: ${message}
      
      INSTRUÇÕES CRÍTICAS:
      1. NUNCA invente dados. Use APENAS as informações disponíveis nas tabelas ou fontes fornecidas.
      2. NUNCA use placeholders como [Categoria 1], [Produto X] ou similares.
      3. Se você não tem informações específicas, diga claramente que não tem essa informação nos dados disponíveis.
      4. Quando o usuário pedir para listar itens, SEMPRE use os dados reais das tabelas, com os nomes e valores exatos que estão nos dados.
      5. Quando mencionar categorias, produtos, ou qualquer entidade, use APENAS nomes que realmente existem nos dados fornecidos.
      6. Não assuma categorias ou estruturas que não estão explicitamente nos dados.
      ${sqlResults ? '7. Use os resultados SQL obtidos diretamente do banco de dados para responder com precisão.' : ''}
      
      INSTRUÇÕES PARA CONSULTAS DE BANCO DE DADOS:
      1. Quando o usuário pedir informações que parecem estar em um banco de dados, sempre tente entender a intenção.
      2. Não exija que o usuário use os nomes exatos das tabelas ou campos do banco de dados.
      3. Use sua compreensão das tabelas disponíveis e seus campos para mapear a pergunta do usuário para os dados corretos.
      4. Se o usuário pedir para "listar perguntas", você deve verificar todas as tabelas e encontrar a que contém perguntas.
      5. Se o usuário pedir produtos em uma categoria específica, use apenas categorias reais que existem nos dados.
      6. Examine cada tabela disponível, seus campos, e dados de amostra para determinar a melhor correspondência para a consulta.
      7. Quando o usuário pedir algo vago como "mostre os produtos" ou "quais opções há", liste os dados reais das tabelas disponíveis.

      EXEMPLOS DE RESPOSTAS CORRETAS:
      - Se os dados mostram produtos como "Laptop Dell XPS", "iPhone 13", responda com esses nomes exatos.
      - Se o usuário perguntar sobre categorias e os dados mostram "Eletrônicos", "Roupas", use essas categorias específicas.
      - Se o usuário pedir "quanto custa X" e X não existe nos dados, diga "Não encontrei informações sobre X nos dados disponíveis".
      - Se o usuário pedir "listar produtos" e o banco tem "Camisa Azul", "Calça Jeans", liste exatamente esses produtos.
      - NUNCA responda "Aqui estão os produtos da [Categoria X]" - use o nome real da categoria como "Aqui estão os produtos de Eletrônicos".

      Por favor, forneça uma resposta útil e relevante com base no contexto e no histórico da conversa.
      Mantenha a resposta concisa e focada na pergunta do usuário.
    `;

    // Generate AI response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    if (!aiResponse) {
      throw new Error("No response from AI model");
    }

    // Save AI response
    await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        chatId,
      },
    });

    return NextResponse.json({ response: aiResponse }, { headers: corsHeaders });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Função auxiliar para verificar se a mensagem parece ser uma pergunta sobre dados
function containsDatabaseQuestion(message: string): boolean {
  const dbKeywords = [
    'listar', 'mostrar', 'exibir', 'quais', 'quantos', 'quanto', 'onde', 'quando',
    'lista', 'buscar', 'encontrar', 'procurar', 'obter', 'selecionar',
    'produtos', 'categorias', 'preço', 'valor', 'data', 'cliente', 'pedido',
    'perguntas', 'respostas', 'dúvidas', 'faq'
  ];
  
  const messageLower = message.toLowerCase();
  
  return dbKeywords.some(keyword => messageLower.includes(keyword));
}

// Função para obter o URL base
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`;
}
