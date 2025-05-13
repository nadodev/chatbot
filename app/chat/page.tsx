"use client";

import { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useChatHistory } from '@/app/contexts/ChatHistoryContext';
import { useChatWidget } from '@/app/contexts/ChatWidgetContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { addChat, clearChats } = useChatHistory();
  const { isOpen, toggleChat } = useChatWidget();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState('default');
  const [userName, setUserName] = useState('');
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempWindowSize, setTempWindowSize] = useState(windowSize);
  const [tempUserName, setTempUserName] = useState(userName);
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Marcar que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar configurações do localStorage antes da primeira renderização
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('chatTheme');
      const savedWindowSize = localStorage.getItem('chatWindowSize');
      const savedUserName = localStorage.getItem('chatUserName');
      
      if (savedTheme) {
        setTheme(savedTheme as 'violet' | 'blue' | 'emerald');
        setTempTheme(savedTheme as 'violet' | 'blue' | 'emerald');
      }
      if (savedWindowSize) {
        setWindowSize(savedWindowSize);
        setTempWindowSize(savedWindowSize);
      }
      if (savedUserName) {
        setUserName(savedUserName);
        setTempUserName(savedUserName);
      }
      setMounted(true);
    }
  }, []);

  // Atualizar configurações temporárias quando abrir o modal
  useEffect(() => {
    if (showSettings) {
      setTempTheme(theme);
      setTempWindowSize(windowSize);
      setTempUserName(userName);
    }
  }, [showSettings, theme, windowSize, userName]);

  // Adicionar mensagem de boas-vindas quando o chat é aberto pela primeira vez
  useEffect(() => {
    if (isOpen && messages.length === 0 && userName) {
      setMessages([{
        role: 'assistant',
        content: `Olá ${userName}! 👋\n\nComo posso ajudar você hoje?`
      }]);
    }
  }, [isOpen, messages.length, userName]);

  const saveSettings = () => {
    setTheme(tempTheme);
    setWindowSize(tempWindowSize);
    setUserName(tempUserName);
    localStorage.setItem('chatTheme', tempTheme);
    localStorage.setItem('chatWindowSize', tempWindowSize);
    localStorage.setItem('chatUserName', tempUserName);
    setShowSettings(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      
      // Adicionar ao histórico
      addChat({
        id: Date.now().toString(),
        title: userMessage.substring(0, 30) + '...',
        messages: [...messages, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.content }
        ],
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'violet':
        return {
          from: 'from-violet-600',
          via: 'via-purple-600',
          to: 'to-fuchsia-600',
          hover: 'hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700',
          ring: 'ring-violet-400',
          text: 'text-violet-600',
          bg: 'bg-violet-50/50',
          shadow: 'rgba(147, 51, 234, 0.3)'
        };
      case 'blue':
        return {
          from: 'from-blue-600',
          via: 'via-indigo-600',
          to: 'to-cyan-600',
          hover: 'hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700',
          ring: 'ring-blue-400',
          text: 'text-blue-600',
          bg: 'bg-blue-50/50',
          shadow: 'rgba(37, 99, 235, 0.3)'
        };
      case 'emerald':
        return {
          from: 'from-emerald-600',
          via: 'via-teal-600',
          to: 'to-green-600',
          hover: 'hover:from-emerald-700 hover:via-teal-700 hover:to-green-700',
          ring: 'ring-emerald-400',
          text: 'text-emerald-600',
          bg: 'bg-emerald-50/50',
          shadow: 'rgba(16, 185, 129, 0.3)'
        };
      default:
        return {
          from: 'from-violet-600',
          via: 'via-purple-600',
          to: 'to-fuchsia-600',
          hover: 'hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700',
          ring: 'ring-violet-400',
          text: 'text-violet-600',
          bg: 'bg-violet-50/50',
          shadow: 'rgba(147, 51, 234, 0.3)'
        };
    }
  };

  const getWindowSize = () => {
    switch (windowSize) {
      case 'small':
        return 'w-[350px] h-[28rem]';
      case 'large':
        return 'w-[450px] h-[36rem]';
      default:
        return 'w-[400px] h-[32rem]';
    }
  };

  const colors = getThemeColors();
  const size = getWindowSize();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-hidden">
        {/* Chat Toggle Button */}
        {!isOpen && mounted && (
          <button
            id="chat-toggle-button"
            onClick={() => {
              toggleChat();
              if (!isOpen) setIsMinimized(false);
            }}
            className={`fixed bottom-6 right-6 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 z-50 hover:scale-105 active:scale-95`}
            style={{
              boxShadow: `0 4px 20px ${colors.shadow}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        )}

        {/* Chat Widget */}
        {isOpen && mounted && (
          <div 
            id="chat-widget"
            className={`fixed bottom-24 right-6 ${size} bg-white/95 rounded-3xl shadow-2xl border border-gray-100/50 z-40 transition-all duration-300 ${isMinimized ? 'h-16' : ''}`}
            style={{
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <div 
              id="chat-header"
              className={`bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} text-white p-5 rounded-t-3xl flex justify-between items-center`}
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse ring-2 ring-emerald-400/30"></div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Chat com IA</h2>
                  <p className="text-xs opacity-90 font-medium">Online • Pronto para ajudar</p>
                </div>
              </div>
              <div id="chat-controls" className="flex items-center gap-3">
                {!isMinimized && (
                  <>
                    <button
                      id="clear-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessages([]);
                      }}
                      className="text-white/90 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
                      title="Limpar conversa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      id="settings-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(true);
                      }}
                      className="text-white/90 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
                      title="Configurações"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleChat();
                      }}
                      className="text-white/90 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-6 w-[400px] shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Configurações</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Como você quer ser chamado?</label>
                      <input
                        type="text"
                        value={tempUserName}
                        onChange={(e) => setTempUserName(e.target.value)}
                        placeholder="Digite seu nome"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setTempTheme('violet')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tempTheme === 'violet'
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-violet-200'
                          }`}
                        >
                          <div className="h-8 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600"></div>
                        </button>
                        <button
                          onClick={() => setTempTheme('blue')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tempTheme === 'blue'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="h-8 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600"></div>
                        </button>
                        <button
                          onClick={() => setTempTheme('emerald')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tempTheme === 'emerald'
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-200'
                          }`}
                        >
                          <div className="h-8 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600"></div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Janela</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setTempWindowSize('small')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tempWindowSize === 'small'
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-violet-200'
                          }`}
                        >
                          <div className="h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                        </button>
                        <button
                          onClick={() => setTempWindowSize('default')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tempWindowSize === 'default'
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-violet-200'
                          }`}
                        >
                          <div className="h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                        </button>
                        <button
                          onClick={() => setTempWindowSize('large')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tempWindowSize === 'large'
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-violet-200'
                          }`}
                        >
                          <div className="h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveSettings}
                        className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${colors.from} ${colors.via} ${colors.to} rounded-xl hover:opacity-90 transition-opacity`}
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Content */}
            {!isMinimized && (
              <div className="p-5 flex-1 flex flex-col h-[calc(32rem-5rem)]">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto mb-5 space-y-5 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent hover:scrollbar-thumb-violet-300">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8 max-w-[280px]">
                        <div className={`w-16 h-16 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300 shadow-lg`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <h3 className={`text-xl font-semibold bg-gradient-to-r ${colors.from} ${colors.via} ${colors.to} bg-clip-text text-transparent mb-2`}>Bem-vindo ao Chat!</h3>
                        <p className="text-sm text-gray-500">Como posso ajudar você hoje?</p>
                        <div className="mt-4 flex flex-col gap-2 text-left">
                          <button 
                            onClick={() => setInput("Como posso começar?")}
                            className={`text-sm text-gray-600 hover:${colors.text} transition-colors p-2 rounded-xl hover:${colors.bg} text-left`}
                          >
                            Como posso começar?
                          </button>
                          <button 
                            onClick={() => setInput("Quais são suas funcionalidades?")}
                            className={`text-sm text-gray-600 hover:${colors.text} transition-colors p-2 rounded-xl hover:${colors.bg} text-left`}
                          >
                            Quais são suas funcionalidades?
                          </button>
                          <button 
                            onClick={() => setInput("Como você pode me ajudar?")}
                            className={`text-sm text-gray-600 hover:${colors.text} transition-colors p-2 rounded-xl hover:${colors.bg} text-left`}
                          >
                            Como você pode me ajudar?
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                    >
                      {message.role === 'assistant' && (
                        <div className={`w-9 h-9 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? `bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} text-white rounded-br-none shadow-sm`
                            : 'bg-gray-50/50 text-gray-800 rounded-bl-none border border-gray-100/50 backdrop-blur-sm shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className={`w-9 h-9 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start items-end gap-3">
                      <div className={`w-9 h-9 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="bg-gray-50/50 rounded-2xl p-4 rounded-bl-none border border-gray-100/50 backdrop-blur-sm shadow-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-100/50 pt-5">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <textarea
                      id="chat-input"
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder="Digite sua pergunta... (Enter para enviar)"
                      className="flex-1 border border-gray-200/50 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all text-sm bg-white/50 backdrop-blur-sm shadow-sm"
                      rows={2}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className={`bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} text-white p-4 rounded-2xl ${colors.hover} disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-500 self-end transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-sm`}
                      style={{
                        boxShadow: `0 4px 12px ${colors.shadow}`,
                      }}
                      title="Enviar mensagem"
                    >
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

