import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Category {
  id: string;
  title: string;
  questions: string[];
}

interface CategoryAccumulator {
  [key: string]: Category;
}

export async function GET() {
  try {
    // Buscar todas as FAQs do banco
    const faqs = await prisma.fAQ.findMany({
      orderBy: {
        category: 'asc'
      }
    });

    // Agrupar FAQs por categoria
    const categories = faqs.reduce((acc: CategoryAccumulator, faq) => {
      const category = faq.category || 'Geral';
      if (!acc[category]) {
        acc[category] = {
          id: category.toLowerCase().replace(/\s+/g, '-'),
          title: category,
          questions: []
        };
      }
      acc[category].questions.push(faq.question);
      return acc;
    }, {});

    // Converter para array e ordenar
    const categoriesArray = Object.values(categories);

    return NextResponse.json({ categories: categoriesArray });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
} 