import { NextResponse } from 'next/server';

// Lista de stopwords em português
const stopwords = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'e', 'é', 'são', 'está', 'estão',
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
  'sim', 'não',
  'pois', 'porém', 'mas', 'contudo', 'todavia', 'entretanto',
  'portanto', 'assim', 'logo', 'então',
  'caso', 'embora', 'conquanto'
]);

const importantKeywords = [
  'preço', 'valor', 'custo', 'plano', 'planos', 'quanto', 'custa',
  'suporte', 'mensagens', 'limite', 'personalizar', 'site', 'criação',
  'idioma', 'linguagem', 'conversa', 'integração', 'whatsapp', 'proposta'
];

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "Como posso criar um novo chat?",
    answer: "Para criar um novo chat, vá até o dashboard e clique no botão 'Criar Novo Chat' no canto superior direito. Siga as instruções na tela para configurar seu chat."
  },
  {
    question: "Como posso personalizar meu chat?",
    answer: "Você pode personalizar seu chat através das configurações disponíveis no dashboard. Clique no ícone de edição ao lado do chat que deseja personalizar."
  },
  {
    question: "Como posso integrar o chat no meu site?",
    answer: "Para integrar o chat no seu site, vá até o dashboard, encontre o chat desejado e clique no ícone de código (</>). Copie o código fornecido e cole-o no seu site."
  },
  {
    question: "O chat suporta múltiplos idiomas?",
    answer: "Sim, o chat suporta múltiplos idiomas. Você pode configurar o idioma nas configurações do chat."
  },
  {
    question: "Como posso gerenciar as respostas do chat?",
    answer: "Você pode gerenciar as respostas do chat através do painel de administração. Acesse as configurações do chat para adicionar, editar ou remover respostas."
  }
];

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function tokenize(text: string) {
  return removeAccents(text.toLowerCase())
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopwords.has(word));
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = tokenize(str1);
  const words2 = tokenize(str2);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const keywordScore = commonWords.length / Math.max(words1.length, words2.length);

  const importantWordsFound = commonWords.filter(word => importantKeywords.includes(word));
  const keywordBonus = importantWordsFound.length * 0.2;

  return Math.min(keywordScore + keywordBonus, 1);
}

function findBestMatch(text: string): FAQ | null {
  const normalizedText = removeAccents(text.toLowerCase());
  
  let bestMatch: FAQ | null = null;
  let highestSimilarity = 0;

  for (const faq of faqs) {
    const normalizedQuestion = removeAccents(faq.question.toLowerCase());
    const similarity = calculateSimilarity(normalizedText, normalizedQuestion);
    
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = faq;
    }
  }

  return highestSimilarity > 0.6 ? bestMatch : null;
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    const bestMatch = findBestMatch(message);
    
    if (bestMatch) {
      return NextResponse.json({
        answer: bestMatch.answer,
        question: bestMatch.question
      });
    }

    return NextResponse.json({
      answer: "Desculpe, não encontrei uma resposta específica para sua pergunta. Por favor, tente reformular ou entre em contato com nosso suporte.",
      question: message
    });

  } catch (error) {
    console.error('Error processing FAQ chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
