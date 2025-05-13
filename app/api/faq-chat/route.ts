import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista de stopwords em português
const stopwords = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'e', 'é', 'é', 'são', 'está', 'estão',
  'de', 'da', 'do', 'das', 'dos',
  'em', 'no', 'na', 'nos', 'nas',
  'com', 'por', 'para', 'pelo', 'pela', 'pelos', 'pelas',
  'que', 'quem', 'qual', 'quais',
  'como', 'quando', 'onde', 'porque',
  'me', 'te', 'se', 'lhe', 'lhes',
  'meu', 'minha', 'meus', 'minhas',
  'seu', 'sua', 'seus', 'suas',
  'nosso', 'nossa', 'nossos', 'nossas',
  'este', 'esta', 'estes', 'estas',
  'esse', 'essa', 'esses', 'essas',
  'aquele', 'aquela', 'aqueles', 'aquelas',
  'isto', 'isso', 'aquilo',
  'muito', 'pouco', 'mais', 'menos',
  'tão', 'tanto', 'quanto',
  'tudo', 'nada', 'algo', 'algum', 'alguma', 'alguns', 'algumas',
  'nenhum', 'nenhuma', 'nenhuns', 'nenhumas',
  'cada', 'qualquer', 'quaisquer',
  'todo', 'toda', 'todos', 'todas',
  'outro', 'outra', 'outros', 'outras',
  'mesmo', 'mesma', 'mesmos', 'mesmas',
  'tal', 'tais',
  'quase', 'já', 'ainda', 'sempre', 'nunca', 'jamais',
  'agora', 'antes', 'depois', 'hoje', 'ontem', 'amanhã',
  'aqui', 'ali', 'lá', 'cá', 'acolá',
  'sim', 'não', 'não',
  'pois', 'porém', 'mas', 'contudo', 'todavia', 'entretanto',
  'portanto', 'assim', 'logo', 'então',
  'porque', 'pois', 'que', 'quando', 'enquanto',
  'se', 'caso', 'embora', 'conquanto',
  'quanto', 'quanto mais', 'quanto menos',
  'tanto', 'tanto mais', 'tanto menos',
  'como', 'assim como', 'tal como',
  'que', 'o que', 'a que', 'os que', 'as que',
  'quem', 'o quem', 'a quem', 'os quem', 'as quem',
  'qual', 'o qual', 'a qual', 'os quais', 'as quais',
  'cujo', 'cuja', 'cujos', 'cujas',
  'onde', 'aonde', 'donde',
  'quando', 'desde', 'até', 'durante',
  'por', 'para', 'a', 'ante', 'após', 'até', 'com', 'contra',
  'de', 'desde', 'em', 'entre', 'para', 'perante', 'por',
  'sem', 'sob', 'sobre', 'trás'
]);

// Função para remover acentos
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Função para tokenizar e limpar texto
function tokenize(text: string): string[] {
  return removeAccents(text.toLowerCase())
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopwords.has(word));
}

// Função para calcular similaridade entre strings
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = tokenize(str1);
  const words2 = tokenize(str2);
  
  // Contar palavras em comum
  const commonWords = words1.filter(word => words2.includes(word));
  
  // Calcular pontuação baseada em palavras-chave
  const keywordScore = commonWords.length / Math.max(words1.length, words2.length);
  
  // Bônus para palavras-chave importantes
  const importantKeywords = ['preço', 'valor', 'custo', 'plano', 'planos', 'quanto', 'custa'];
  const importantWordsFound = commonWords.filter(word => importantKeywords.includes(word));
  const keywordBonus = importantWordsFound.length * 0.2;
  
  return Math.min(keywordScore + keywordBonus, 1);
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Buscar todas as FAQs do banco de dados
    const faqs = await prisma.fAQ.findMany();

    // Encontrar a FAQ mais relevante
    let bestMatch = null;
    let highestSimilarity = 0;

    for (const faq of faqs) {
      const similarity = calculateSimilarity(message, faq.question);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = faq;
      }
    }

    // Se a similaridade for muito baixa, retornar uma resposta padrão
    if (highestSimilarity < 0.15) { // Reduzido o limiar para 0.15
      return NextResponse.json({
        response: "Desculpe, não encontrei uma resposta específica para sua pergunta. Por favor, tente reformular ou entre em contato com nosso suporte para mais informações."
      });
    }

    return NextResponse.json({
      response: bestMatch?.answer || "Não encontrei uma resposta específica para sua pergunta."
    });

  } catch (error) {
    console.error('Erro ao processar pergunta:', error);
    return NextResponse.json(
      { error: 'Erro ao processar sua pergunta' },
      { status: 500 }
    );
  }
} 