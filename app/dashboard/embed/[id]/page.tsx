"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ChatConfig {
  id: string;
  name: string;
  avatar: string;
  greeting: string;
  appearance: {
    primaryColor: string;
    userBubbleColor: string;
    aiBubbleColor: string;
    font: string;
    position: 'bottom-right' | 'floating' | 'popup';
    animation: string;
    darkMode: boolean;
  };
}

const defaultConfig: ChatConfig = {
  id: '',
  name: '',
  avatar: '🤖',
  greeting: 'Olá! Como posso ajudar?',
  appearance: {
    primaryColor: '#6366f1',
    userBubbleColor: '#e5e7eb',
    aiBubbleColor: '#f3f4f6',
    font: 'Inter',
    position: 'bottom-right',
    animation: 'slide-up',
    darkMode: false,
  },
};

export default function EmbedCode({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [config, setConfig] = useState<ChatConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // TODO: Fetch chat data from API
    const fetchChat = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConfig({
          ...defaultConfig,
          id: params.id,
          name: 'Suporte do Site',
          avatar: '🤖',
          greeting: 'Olá! Como posso ajudar?',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setLoading(false);
      }
    };

    fetchChat();
  }, [params.id]);

  const getEmbedCode = () => {
    const baseUrl = window.location.origin;
    return `<script>
  window.CHAT_CONFIG = {
    id: "${config.id}",
    name: "${config.name}",
    avatar: "${config.avatar}",
    greeting: "${config.greeting}",
    appearance: {
      primaryColor: "${config.appearance.primaryColor}",
      userBubbleColor: "${config.appearance.userBubbleColor}",
      aiBubbleColor: "${config.appearance.aiBubbleColor}",
      font: "${config.appearance.font}",
      position: "${config.appearance.position}",
      animation: "${config.appearance.animation}",
      darkMode: ${config.appearance.darkMode}
    }
  };
  (function(d, t) {
    var s = d.createElement(t);
    s.src = "${baseUrl}/widget.js";
    s.async = true;
    d.head.appendChild(s);
  })(document, "script");
</script>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-violet-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-900">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Código de Incorporação</h1>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Instruções</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>1. Copie o código abaixo</p>
                  <p>2. Cole o código no seu site, antes do fechamento da tag &lt;/body&gt;</p>
                  <p>3. O widget do chat será carregado automaticamente</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="embed-code" className="block text-sm font-medium text-gray-700">
                    Código de Incorporação
                  </label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-violet-700 bg-violet-100 hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                  >
                    {copied ? (
                      <>
                        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <pre
                    id="embed-code"
                    className="block w-full overflow-x-auto p-4 bg-gray-50 rounded-lg border border-gray-300 text-sm text-gray-900 font-mono"
                  >
                    {getEmbedCode()}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Personalização</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Você pode personalizar a aparência do widget ajustando as configurações no objeto CHAT_CONFIG:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>primaryColor: Cor principal do widget</li>
                    <li>userBubbleColor: Cor das bolhas de mensagem do usuário</li>
                    <li>aiBubbleColor: Cor das bolhas de mensagem do assistente</li>
                    <li>font: Fonte do texto</li>
                    <li>position: Posição do widget (bottom-right, floating, popup)</li>
                    <li>animation: Animação de entrada (slide-up, fade-in, bounce)</li>
                    <li>darkMode: Modo escuro (true/false)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Exemplo</h3>
                <div className="mt-2">
                  <div className="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{config.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-sm text-gray-900">{config.greeting}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 