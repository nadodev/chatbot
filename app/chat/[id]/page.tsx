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
    if (chat.appearance) appearance = JSON.parse(chat.appearance.toString());
  } catch (e) {
    console.error("Erro ao parsear appearance:", e);
  }

  try {
    if (chat.behavior) behavior = JSON.parse(chat.behavior.toString());
  } catch (e) {
    console.error("Erro ao parsear behavior:", e);
  }

  try {
    if (chat.dbConfig) dbConfig = JSON.parse(chat.dbConfig.toString());
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