'use client';

import { useState } from 'react';

interface ChatInterfaceProps {
  chatId: string;
  name: string;
  avatar: string;
  greeting: string;
  appearance: any;
  behavior: any;
  dbConfig: any;
  isEmbedded?: boolean;
}

export default function ChatInterface({
  chatId,
  name,
  avatar,
  greeting,
  appearance,
  behavior,
  dbConfig,
  isEmbedded = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: greeting },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Adiciona a mensagem do usuário
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/widget-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          message: userMessage,
        }),
      });

      if (!response.ok) throw new Error('Erro na resposta do chat');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isEmbedded ? 'max-w-full' : 'max-w-2xl mx-auto'}`}>
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{avatar}</span>
          <h1 className="text-lg font-semibold">{name}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
} 