'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  title: string;
  questions: string[];
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'chat'>('categories');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/faq-categories');
        const data = await response.json();
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleQuestionClick = async (question: string) => {
    setChatHistory(prev => [...prev, { type: 'user', content: question }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/faq-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();
      setChatHistory(prev => [...prev, { type: 'bot', content: data.response }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      handleQuestionClick(message);
      setMessage('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="bg-gradient-to-r from-violet-600 to-blue-500 p-4 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Perguntas Frequentes</h2>
                <p className="text-sm opacity-90">Escolha uma categoria ou converse com nosso assistente</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Fechar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs de navegação */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'categories'
                      ? 'text-violet-600 border-b-2 border-violet-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Categorias
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'text-violet-600 border-b-2 border-violet-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Chat
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-hidden">
              {/* Aba de Categorias */}
              <div className={`h-full ${activeTab === 'categories' ? 'block' : 'hidden'}`}>
                <div className="h-full flex flex-col md:flex-row overflow-hidden">
                  {/* Lista de Categorias */}
                  <div className="w-full md:w-1/3 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-violet-100 text-violet-700'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {category.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Perguntas */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      {categories.find(c => c.id === selectedCategory)?.title || 'Perguntas'}
                    </h3>
                    <div className="space-y-2">
                      {categories
                        .find(c => c.id === selectedCategory)
                        ?.questions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleQuestionClick(question);
                              setActiveTab('chat');
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                          >
                            {question}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aba de Chat */}
              <div className={`h-full ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
                <div className="h-full flex flex-col">
                  {/* Cabeçalho do chat */}
                  <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
                      <p className="text-sm text-gray-600">Converse com nosso assistente</p>
                    </div>
                    <button
                      onClick={() => setChatHistory([])}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Limpar chat"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Container do chat */}
                  <div className="flex-1 relative">
                    {/* Histórico do chat com rolagem */}
                    <div className="absolute inset-0 overflow-y-auto p-4 pb-20">
                      <div className="space-y-4">
                        {chatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg p-3 whitespace-pre-wrap break-words ${
                                msg.type === 'user'
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input do chat fixo */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                      <form onSubmit={handleSubmit} className="flex gap-2">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-lg hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all self-end"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 