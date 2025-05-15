import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para remover acentos
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Função para tokenizar e limpar texto
function tokenize(text: string): string[] {
  return removeAccents(text.toLowerCase())
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Buscar todas as FAQs do banco de dados
    const faqs = await prisma.fAQ.findMany();

    // Filtrar e ordenar FAQs baseado na similaridade com a query
    const suggestions = faqs
      .map(faq => {
        const faqWords = tokenize(faq.question);
        const queryWords = tokenize(query);
        
        // Calcular similaridade
        const matchingWords = queryWords.filter(word =>
          faqWords.some(faqWord => faqWord.includes(word))
        );
        const similarity = matchingWords.length / queryWords.length;

        return {
          question: faq.question,
          similarity
        };
      })
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5) // Limitar a 5 sugestões
      .map(item => item.question);

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sugestões' },
      { status: 500 }
    );
  }
} 