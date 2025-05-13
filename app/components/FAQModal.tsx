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
            className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex h-[90vh]">
              {/* Sidebar com categorias e perguntas */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
                  {isLoadingCategories ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {categories.map(category => (
                        <div key={category.id}>
                          <h3 
                            className={`text-lg font-semibold mb-3 cursor-pointer ${
                              selectedCategory === category.id ? 'text-violet-600' : 'text-gray-700'
                            }`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            {category.title}
                          </h3>
                          {selectedCategory === category.id && (
                            <div className="space-y-2">
                              {category.questions.map((question, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleQuestionClick(question)}
                                  className="w-full text-left p-3 rounded-lg hover:bg-violet-50 text-gray-600 hover:text-violet-600 transition-colors"
                                >
                                  {question}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Área do chat */}
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Chat de Suporte</h3>
                  <button
                    onClick={() => setChatHistory([])}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpar Chat
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 