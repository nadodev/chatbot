"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  CogIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import ChatConfigForm from '@/app/components/ChatConfigForm';

interface ChatStats {
  totalMessages: number;
  activeChats: number;
  averageResponseTime: number;
  userSatisfaction: number;
}

interface ChatConfig {
  id: string;
  name: string;
  aiProvider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ChatStats>({
    totalMessages: 0,
    activeChats: 0,
    averageResponseTime: 0,
    userSatisfaction: 0
  });
  const [chats, setChats] = useState<ChatConfig[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    // Carregar estatísticas
    fetchStats();
    // Carregar chats
    fetchChats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <button
              onClick={() => router.push('/settings')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              <CogIcon className="h-5 w-5 mr-2" />
              Configurações
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-violet-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Mensagens</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalMessages}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-violet-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Chats Ativos</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.activeChats}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-violet-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tempo Médio de Resposta</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.averageResponseTime}s</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-violet-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Satisfação dos Usuários</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.userSatisfaction}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chats List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Seus Chats</h2>
            <button
              onClick={() => router.push('/chat/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700"
            >
              Novo Chat
            </button>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <li key={chat.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-violet-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{chat.name}</h3>
                        <p className="text-sm text-gray-500">
                          {chat.aiProvider} - {chat.model}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedChat(chat.id);
                          setIsConfigOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <CogIcon className="h-4 w-4 mr-1.5" />
                        Configurar
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/embed/${chat.id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1.5" />
                        Código
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Config Modal */}
      <Dialog
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Configurações do Chat
            </Dialog.Title>
            {selectedChat && (
              <ChatConfigForm
                chatId={selectedChat}
                onClose={() => setIsConfigOpen(false)}
              />
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
} 