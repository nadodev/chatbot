"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ChatConfig {
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

export default function CreateChat() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<ChatConfig>(defaultConfig);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    // TODO: Implement save logic
    router.push('/dashboard');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setConfig({
        ...config,
        sources: {
          ...config.sources,
          files: Array.from(e.target.files),
        },
      });
    }
  };

  const handleUrlAdd = (url: string) => {
    if (url && !config.sources.urls.includes(url)) {
      setConfig({
        ...config,
        sources: {
          ...config.sources,
          urls: [...config.sources.urls, url],
        },
      });
    }
  };

  const handleUrlRemove = (url: string) => {
    setConfig({
      ...config,
      sources: {
        ...config.sources,
        urls: config.sources.urls.filter(u => u !== url),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Criar Novo Chat</h1>
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
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
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
                      value={config.avatar}
                      onChange={(e) => setConfig({ ...config, avatar: e.target.value })}
                      className="block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                      placeholder="🤖"
                    />
                    <span className="text-2xl">{config.avatar}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="greeting" className="block text-sm font-medium text-gray-700">
                    Saudação Inicial
                  </label>
                  <textarea
                    id="greeting"
                    value={config.greeting}
                    onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    placeholder="Ex: Olá! Como posso ajudar?"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload de Arquivos
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500"
                        >
                          <span>Upload de arquivos</span>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt,.csv"
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, TXT, CSV até 10MB
                      </p>
                    </div>
                  </div>
                  {config.sources.files.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {config.sources.files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = [...config.sources.files];
                              newFiles.splice(index, 1);
                              setConfig({
                                ...config,
                                sources: { ...config.sources, files: newFiles },
                              });
                            }}
                            className="text-red-600 hover:text-red-500"
                          >
                            Remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URLs para Crawler
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="url"
                      className="flex-1 block w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                      placeholder="https://exemplo.com"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          handleUrlAdd(input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        handleUrlAdd(input.value);
                        input.value = '';
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                  {config.sources.urls.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {config.sources.urls.map((url, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span>{url}</span>
                          <button
                            type="button"
                            onClick={() => handleUrlRemove(url)}
                            className="text-red-600 hover:text-red-500"
                          >
                            Remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label htmlFor="database" className="block text-sm font-medium text-gray-700">
                    Conexão com Banco de Dados (Opcional)
                  </label>
                  <input
                    type="text"
                    id="database"
                    value={config.sources.database}
                    onChange={(e) => setConfig({
                      ...config,
                      sources: { ...config.sources, database: e.target.value },
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    placeholder="mysql://user:password@localhost:3306/database"
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
                          appearance: { ...config.appearance, position: position.id as any },
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
                        onChange={(e) => setConfig({
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
                        onChange={(e) => setConfig({
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Prévia do Chat</h3>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
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
        )}
      </main>
    </div>
  );
} 