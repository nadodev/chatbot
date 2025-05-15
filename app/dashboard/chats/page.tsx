"use client";

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import ChatWizard from '@/components/ChatWizard';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  greeting: string;
  appearance: string;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) throw new Error('Falha ao carregar chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (config: any) => {
    try {
      const endpoint = editingChat ? `/api/chats/${editingChat.id}` : '/api/chats';
      const method = editingChat ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          avatar: config.avatar,
          greeting: config.greeting,
          appearance: JSON.stringify(config.appearance),
        }),
      });

      if (!response.ok) throw new Error('Falha ao salvar chat');

      await fetchChats();
      setShowWizard(false);
      setEditingChat(null);
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = (chat: Chat) => {
    setEditingChat({
      ...chat,
      appearance: JSON.parse(chat.appearance),
    });
    setShowWizard(true);
  };

  const handleDelete = async (chatId: string) => {
    if (!confirm('Tem certeza que deseja excluir este chat?')) return;

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir chat');

      await fetchChats();
    } catch (error) {
      console.error('Erro ao excluir chat:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  if (showWizard) {
    return (
      <div className="p-6">
        <ChatWizard
          initialConfig={editingChat ? {
            ...editingChat,
            appearance: typeof editingChat.appearance === 'string' 
              ? JSON.parse(editingChat.appearance)
              : editingChat.appearance,
          } : undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowWizard(false);
            setEditingChat(null);
          }}
        />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Chats</h1>
        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          Novo Chat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">{chat.avatar}</div>
              <div className="flex-1">
                <h3 className="font-medium">{chat.name}</h3>
                <p className="text-sm text-gray-500 truncate">{chat.greeting}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleEdit(chat)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(chat.id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhum chat criado ainda. Clique em "Novo Chat" para começar.
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
} 