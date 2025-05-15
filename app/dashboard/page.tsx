"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Chat {
  id: string;
  name: string;
  status: 'active' | 'paused';
  avatar: string;
  greeting: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Carregar chats
  useEffect(() => {
    const loadChats = async () => {
      setIsLoadingChats(true);
      try {
        await fetchChats();
      } catch (error) {
        console.error('Erro ao carregar chats:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) {
        throw new Error('Erro ao buscar chats');
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setChats(data);
      } else {
        console.error('Resposta inválida da API de chats:', data);
        setChats([]);
      }
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      setChats([]);
    }
  };

  const handleCreateChat = () => {
    router.push('/dashboard/create');
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const response = await fetch(`/api/chats?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
    }
  };

  const handleDuplicateChat = async (chat: Chat) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${chat.name} (Cópia)`,
          avatar: chat.avatar,
          greeting: chat.greeting,
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats([...chats, newChat]);
      }
    } catch (error) {
      console.error('Erro ao duplicar chat:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    try {
      const response = await fetch(`/api/chats?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: chat.status === 'active' ? 'paused' : 'active',
        }),
      });

      if (response.ok) {
        setChats(chats.map(c => 
          c.id === id 
            ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
            : c
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar status do chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleCreateChat}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Criar Novo Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingChats ? (
          <div className="flex justify-center">
            <div className="text-xl text-gray-600">Carregando chats...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{chat.avatar}</span>
                      <h3 className="text-lg font-medium text-gray-900">{chat.name}</h3>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        chat.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {chat.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{chat.greeting}</p>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleToggleStatus(chat.id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {chat.status === 'active' ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDuplicateChat(chat)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/edit/${chat.id}`)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Editar
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 