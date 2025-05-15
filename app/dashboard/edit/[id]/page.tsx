"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChatSources from '@/app/components/ChatSources';
import ChatPreview from '@/app/components/ChatPreview';

interface ChatConfig {
  id: string;
  name: string;
  avatar: string;
  greeting: string;
  sources: {
    files: File[];
    urls: string[];
    database: string;
  };
  appearance: {
    primaryColor: string;
    userBubbleColor: string;
    aiBubbleColor: string;
    font: string;
    position: 'bottom-right' | 'floating' | 'popup';
    animation: string;
    darkMode: boolean;
  };
  behavior: {
    typingDelay: number;
    offlineMessage: string;
    responseMode: 'complete' | 'streaming';
    tokenLimit: number;
  };
}

const defaultConfig: ChatConfig = {
  id: '',
  name: '',
  avatar: '🤖',
  greeting: 'Olá! Como posso ajudar?',
  sources: {
    files: [],
    urls: [],
    database: '',
  },
  appearance: {
    primaryColor: '#6366f1',
    userBubbleColor: '#e5e7eb',
    aiBubbleColor: '#f3f4f6',
    font: 'Inter',
    position: 'bottom-right',
    animation: 'slide-up',
    darkMode: false,
  },
  behavior: {
    typingDelay: 1000,
    offlineMessage: 'Desculpe, estou indisponível no momento. Por favor, tente novamente mais tarde.',
    responseMode: 'streaming',
    tokenLimit: 2000,
  },
};

const fonts = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Montserrat',
];

const positions = [
  { id: 'bottom-right', label: 'Canto Inferior Direito' },
  { id: 'floating', label: 'Flutuante' },
  { id: 'popup', label: 'Pop-up' },
];

const animations = [
  { id: 'slide-up', label: 'Deslizar para Cima' },
  { id: 'fade-in', label: 'Aparecer Suavemente' },
  { id: 'bounce', label: 'Quicar' },
];

interface ChatData {
  name: string;
  avatar: string;
  greeting: string;
  status: 'active' | 'paused';
}

export default function EditChat({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<ChatConfig>(defaultConfig);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ChatData>({
    name: '',
    avatar: '🤖',
    greeting: '',
    status: 'active'
  });

  useEffect(() => {
    fetchChat();
  }, [params.id]);

  const fetchChat = async () => {
    try {
      const response = await fetch(`/api/chats/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
        
        // Parse appearance and behavior from JSON strings
        const appearance = data.appearance ? JSON.parse(data.appearance) : defaultConfig.appearance;
        const behavior = data.behavior ? JSON.parse(data.behavior) : defaultConfig.behavior;
        
        setConfig({
          ...defaultConfig,
          id: params.id,
          name: data.name,
          avatar: data.avatar,
          greeting: data.greeting,
          appearance,
          behavior,
        });
        setLoading(false);
      } else {
        alert('Chat não encontrado');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao buscar chat:', error);
      alert('Erro ao buscar chat');
      router.push('/dashboard');
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/chats/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          appearance: config.appearance,
          behavior: config.behavior,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao atualizar chat');
      }
    } catch (error) {
      console.error('Erro ao atualizar chat:', error);
      alert('Erro ao atualizar chat');
    }
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
            <h1 className="text-2xl font-semibold text-gray-900">Editar Chat</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Prévia
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Salvar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* Progress Steps */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <nav className="flex items-center justify-center" aria-label="Progress">
              <ol className="flex items-center space-x-5">
                <li>
                  <div className={`flex items-center ${currentStep >= 1 ? 'text-violet-600' : 'text-gray-500'}`}>
                    <span className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                      <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                    </span>
                    <span className="ml-3 text-sm font-medium">Nome e Identidade</span>
                  </div>
                </li>
                <li>
                  <div className={`flex items-center ${currentStep >= 2 ? 'text-violet-600' : 'text-gray-500'}`}>
                    <span className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                      <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                    </span>
                    <span className="ml-3 text-sm font-medium">Fontes</span>
                  </div>
                </li>
                <li>
                  <div className={`flex items-center ${currentStep >= 3 ? 'text-violet-600' : 'text-gray-500'}`}>
                    <span className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                      <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                    </span>
                    <span className="ml-3 text-sm font-medium">Aparência</span>
                  </div>
                </li>
                <li>
                  <div className={`flex items-center ${currentStep >= 4 ? 'text-violet-600' : 'text-gray-500'}`}>
                    <span className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                      <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                    </span>
                    <span className="ml-3 text-sm font-medium">Comportamento</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Step Content */}
          <div className="px-4 py-5 sm:p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome do Chat
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    placeholder="Ex: Suporte do meu site"
                  />
                </div>

                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                    Avatar
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input
                      type="text"
                      id="avatar"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                      placeholder="🤖"
                    />
                    <span className="text-2xl">{formData.avatar}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="greeting" className="block text-sm font-medium text-gray-700">
                    Saudação Inicial
                  </label>
                  <textarea
                    id="greeting"
                    value={formData.greeting}
                    onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    placeholder="Ex: Olá! Como posso ajudar?"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Knowledge Base</h3>
                  <ChatSources
                    chatId={params.id}
                    onSourceAdded={() => {
                      // Refresh chat data if needed
                    }}
                    onSourceRemoved={() => {
                      // Refresh chat data if needed
                    }}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                      Cor Principal
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={config.appearance.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          appearance: { ...config.appearance, primaryColor: e.target.value },
                        })}
                        className="h-8 w-8 rounded-md border border-gray-300"
                      />
                      <input
                        type="text"
                        value={config.appearance.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          appearance: { ...config.appearance, primaryColor: e.target.value },
                        })}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="font" className="block text-sm font-medium text-gray-700">
                      Fonte
                    </label>
                    <select
                      id="font"
                      value={config.appearance.font}
                      onChange={(e) => setConfig({
                        ...config,
                        appearance: { ...config.appearance, font: e.target.value },
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Posição do Widget
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className={`relative rounded-lg border p-4 cursor-pointer ${
                          config.appearance.position === position.id
                            ? 'border-violet-500 ring-2 ring-violet-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => setConfig({
                          ...config,
                          appearance: { ...config.appearance, position: position.id as 'bottom-right' | 'floating' | 'popup' },
                        })}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="position"
                            value={position.id}
                            checked={config.appearance.position === position.id}
                            onChange={() => {}}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">
                            {position.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Animação de Entrada
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {animations.map((animation) => (
                      <div
                        key={animation.id}
                        className={`relative rounded-lg border p-4 cursor-pointer ${
                          config.appearance.animation === animation.id
                            ? 'border-violet-500 ring-2 ring-violet-500'
                            : 'border-gray-300'
                        }`}
                        onClick={() => setConfig({
                          ...config,
                          appearance: { ...config.appearance, animation: animation.id },
                        })}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="animation"
                            value={animation.id}
                            checked={config.appearance.animation === animation.id}
                            onChange={() => {}}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">
                            {animation.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={config.appearance.darkMode}
                    onChange={(e) => setConfig({
                      ...config,
                      appearance: { ...config.appearance, darkMode: e.target.checked },
                    })}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                  />
                  <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
                    Modo Escuro
                  </label>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="typingDelay" className="block text-sm font-medium text-gray-700">
                    Delay de Digitação (ms)
                  </label>
                  <input
                    type="number"
                    id="typingDelay"
                    value={config.behavior.typingDelay}
                    onChange={(e) => setConfig({
                      ...config,
                      behavior: { ...config.behavior, typingDelay: parseInt(e.target.value) },
                    })}
                    min="0"
                    max="5000"
                    step="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="offlineMessage" className="block text-sm font-medium text-gray-700">
                    Mensagem Offline
                  </label>
                  <textarea
                    id="offlineMessage"
                    value={config.behavior.offlineMessage}
                    onChange={(e) => setConfig({
                      ...config,
                      behavior: { ...config.behavior, offlineMessage: e.target.value },
                    })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Modo de Resposta
                  </label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="responseModeComplete"
                        name="responseMode"
                        value="complete"
                        checked={config.behavior.responseMode === 'complete'}
                        onChange={() => setConfig({
                          ...config,
                          behavior: { ...config.behavior, responseMode: 'complete' },
                        })}
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                      />
                      <label htmlFor="responseModeComplete" className="ml-3 block text-sm font-medium text-gray-700">
                        Completa
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="responseModeStreaming"
                        name="responseMode"
                        value="streaming"
                        checked={config.behavior.responseMode === 'streaming'}
                        onChange={() => setConfig({
                          ...config,
                          behavior: { ...config.behavior, responseMode: 'streaming' },
                        })}
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                      />
                      <label htmlFor="responseModeStreaming" className="ml-3 block text-sm font-medium text-gray-700">
                        Streaming
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="tokenLimit" className="block text-sm font-medium text-gray-700">
                    Limite de Tokens por Resposta
                  </label>
                  <input
                    type="number"
                    id="tokenLimit"
                    value={config.behavior.tokenLimit}
                    onChange={(e) => setConfig({
                      ...config,
                      behavior: { ...config.behavior, tokenLimit: parseInt(e.target.value) },
                    })}
                    min="100"
                    max="4000"
                    step="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  Voltar
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  Salvar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        {previewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Preview</h3>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="h-[600px] relative">
                <ChatPreview config={config} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 