import { notFound } from 'next/navigation';
import prisma from '@/app/lib/db';
import ChatInterface from '@/app/components/ChatInterface';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const chat = await prisma.chat.findUnique({
    where: { id: params.id },
  });

  if (!chat) {
    notFound();
  }

  // Tratamento seguro para os objetos JSON
  let appearance = {};
  let behavior = {};
  let dbConfig = {};

  try {
    if (chat.appearance) {
      appearance = typeof chat.appearance === 'string'
        ? JSON.parse(chat.appearance)
        : chat.appearance;
    }
  } catch (e) {
    console.error("Erro ao parsear appearance:", e);
  }

  try {
    if (chat.behavior) {
      behavior = typeof chat.behavior === 'string'
        ? JSON.parse(chat.behavior)
        : chat.behavior;
    }
  } catch (e) {
    console.error("Erro ao parsear behavior:", e);
  }

  try {
    if (chat.dbConfig) {
      dbConfig = typeof chat.dbConfig === 'string'
        ? JSON.parse(chat.dbConfig)
        : chat.dbConfig;
    }
  } catch (e) {
    console.error("Erro ao parsear dbConfig:", e);
  }

  return (
    <div className="h-screen bg-white">
      <ChatInterface
        chatId={chat.id}
        name={chat.name || "Chat"}
        avatar={chat.avatar || "🤖"}
        greeting={chat.greeting || "Olá! Como posso ajudar?"}
        appearance={appearance}
        behavior={behavior}
        dbConfig={dbConfig}
        isEmbedded={true}
      />
    </div>
  );
} 