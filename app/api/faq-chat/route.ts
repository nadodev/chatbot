import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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

    // Buscar FAQs relevantes
    const relevantFAQs = await prisma.fAQ.findMany({
      where: {
        OR: [
          {
            question: {
              contains: message
            }
          },
          {
            answer: {
              contains: message
            }
          }
        ]
      }
    });

    // Preparar o contexto para o Gemini
    const context = relevantFAQs.map(faq => 
      `Pergunta: ${faq.question}\nResposta: ${faq.answer}`
    ).join('\n\n');

    // Criar o prompt para o Gemini
    const prompt = `Com base nas seguintes FAQs e na pergunta do usuário, forneça uma resposta útil e informativa:

FAQs:
${context}

Pergunta do usuário: ${message}

Por favor, forneça uma resposta que:
1. Seja clara e direta
2. Use as informações das FAQs quando relevante
3. Mantenha um tom profissional e amigável
4. Se não houver FAQs relevantes, forneça uma resposta geral e útil`;

    // Gerar resposta com o Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
} 