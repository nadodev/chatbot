import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Constantes
const MAX_SUGGESTIONS = 5;
const MAX_LENGTH = 100;
const MIN_QUERY_LENGTH = 2; // Aumentado para evitar chamadas desnecessárias

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
  'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  'Access-Control-Allow-Credentials': 'true',
};

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Função para extrair trecho relevante do texto
function extractRelevantSnippet(content: string, query: string, maxLength: number = 100): string {
  const normalizedContent = content.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  // Tentar encontrar uma correspondência exata
  const index = normalizedContent.indexOf(normalizedQuery);
  if (index !== -1) {
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + normalizedQuery.length + 30);
    let snippet = content.substring(start, end);
    
    // Adicionar elipses se necessário
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }
  
  // Se não encontrar correspondência exata, procurar por palavras individuais
  const queryWords = normalizedQuery.split(/\s+/);
  for (const word of queryWords) {
    const wordIndex = normalizedContent.indexOf(word);
    if (wordIndex !== -1) {
      const start = Math.max(0, wordIndex - 20);
      const end = Math.min(content.length, wordIndex + word.length + 20);
      let snippet = content.substring(start, end);
      
      if (start > 0) snippet = '...' + snippet;
      if (end < content.length) snippet = snippet + '...';
      
      return snippet;
    }
  }
  
  // Se não encontrar nada, retornar o início do conteúdo
  return content.substring(0, maxLength) + '...';
}

// Função para calcular relevância
function calculateRelevance(query: string, content: string, type: string): number {
  const normalizedQuery = query.toLowerCase();
  const normalizedContent = content.toLowerCase();
  
  let score = 0;
  
  // Correspondência exata
  if (normalizedContent.includes(normalizedQuery)) {
    score += 5;
  }
  
  // Correspondência de palavras individuais
  const queryWords = normalizedQuery.split(/\s+/);
  const contentWords = new Set(normalizedContent.split(/\s+/));
  
  queryWords.forEach(word => {
    if (contentWords.has(word)) {
      score += 2;
    }
  });
  
  // Bônus por tipo
  switch (type) {
    case 'message': score += 1; break;
    case 'source': score += 2; break;
    case 'database': score += 3; break;
  }
  
  return score;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: corsHeaders
  });
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, query } = await request.json();

    if (!chatId || !query || query.trim().length < MIN_QUERY_LENGTH) {
      return NextResponse.json({ suggestions: [] }, { headers: corsHeaders });
    }

    // Verificar se o chat existe e não está pausado
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.status === 'paused') {
      return NextResponse.json({ suggestions: [] }, { headers: corsHeaders });
    }

    let suggestions: Array<{
      text: string;
      type: string;
      source: string | null;
      relevance: number;
      category?: string;
    }> = [];

    // Buscar mensagens anteriores
    const messages = await prisma.message.findMany({
      where: { 
        chatId: chatId,
        role: 'assistant'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Processar mensagens sem usar IA
    for (const message of messages) {
      const content = message.content.toString();
      const relevance = calculateRelevance(query, content, 'message');
      
      if (relevance > 0) {
        const snippet = extractRelevantSnippet(content, query);
        suggestions.push({
          text: snippet,
          type: 'message',
          source: 'Histórico da conversa',
          relevance: relevance,
          category: 'Conversas anteriores'
        });
      }
    }

    // Buscar fontes
    const sources = await prisma.chatSource.findMany({
      where: { chatId: chatId },
    });

    // Processar fontes
    for (const source of sources) {
      if (source.type === 'database') {
        try {
          const dbData = JSON.parse(source.content);
          for (const [tableName, tableData] of Object.entries(dbData)) {
            const table = tableData as any;
            if (table.metadata?.semanticKeywords) {
              const relevance = calculateRelevance(query, table.metadata.semanticKeywords.join(' '), 'database');
              if (relevance > 0) {
                suggestions.push({
                  text: `Consultar dados de ${tableName}`,
                  type: 'database',
                  source: source.name,
                  relevance: relevance,
                  category: 'Consultas ao banco de dados'
                });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing database source:', error);
        }
      } else {
        const relevance = calculateRelevance(query, source.content, 'source');
        if (relevance > 0) {
          const snippet = extractRelevantSnippet(source.content, query);
          suggestions.push({
            text: snippet,
            type: 'source',
            source: source.name,
            relevance: relevance,
            category: 'Documentos'
          });
        }
      }
    }

    // Usar IA apenas se não encontrarmos sugestões suficientes e a consulta for significativa
    if (suggestions.length < 2 && query.length >= 4) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        Com base na consulta "${query}", gere 2 sugestões profissionais e relevantes.
        As sugestões devem ser curtas (máximo 50 caracteres) e diretas.
        Formato: uma sugestão por linha
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiSuggestions = response.text().split('\n').filter(s => s.trim());
        
        aiSuggestions.forEach((suggestion, index) => {
          suggestions.push({
            text: suggestion.trim(),
            type: 'ai',
            source: 'IA',
            relevance: 1,
            category: 'Sugestões inteligentes'
          });
        });
      } catch (error) {
        console.error('Error generating AI suggestions:', error);
      }
    }

    // Ordenar por relevância
    suggestions.sort((a, b) => b.relevance - a.relevance);

    // Agrupar por categoria
    const groupedSuggestions = suggestions.reduce((acc, curr) => {
      const category = curr.category || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(curr);
      return acc;
    }, {} as Record<string, typeof suggestions>);

    return NextResponse.json(
      { 
        suggestions: suggestions.slice(0, MAX_SUGGESTIONS),
        groupedSuggestions
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error processing suggestion request:', error);
    return NextResponse.json(
      { error: 'Erro ao processar sugestões', suggestions: [] },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
} 