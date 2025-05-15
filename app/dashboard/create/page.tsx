"use client";

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ChatStepper from '@/app/components/ChatStepper';
import DatabaseSelector from '@/app/components/DatabaseSelector';

interface ChatConfig {
  name: string;
  avatar: string;
  greeting: string;
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    effect: string;
  };
  behavior: {
    temperature: number;
    maxTokens: number;
    aiProvider: string;
    model: string;
  };
  dbConfig: {
    connectionString: string;
    selectedTables: string[];
  };
}

const steps = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Nome, avatar e mensagem inicial'
  },
  {
    id: 'appearance',
    title: 'Aparência',
    description: 'Cores e efeitos visuais'
  },
  {
    id: 'behavior',
    title: 'Comportamento',
    description: 'Configurações de IA'
  },
  {
    id: 'database',
    title: 'Banco de Dados',
    description: 'Conexão e tabelas'
  }
];

export default function CreateChat() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<ChatConfig>({
    name: '',
    avatar: '🤖',
    greeting: 'Olá! Como posso ajudar?',
    appearance: {
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      effect: 'fade'
    },
    behavior: {
      temperature: 0.7,
      maxTokens: 150,
      aiProvider: 'google',
      model: 'gemini-2.0-flash'
    },
    dbConfig: {
      connectionString: '',
      selectedTables: []
    }
  });

  const updateConfig = useCallback((updates: Partial<ChatConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const validateStep = useCallback((stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        if (!config.name.trim()) {
          setError('Por favor, preencha o nome do chat');
          return false;
        }
        break;
      case 1:
        if (!config.appearance.primaryColor || !config.appearance.secondaryColor) {
          setError('Por favor, selecione as cores do chat');
          return false;
        }
        break;
      case 2:
        if (!config.behavior.aiProvider || !config.behavior.model) {
          setError('Por favor, selecione o provedor e modelo de IA');
          return false;
        }
        break;
      case 3:
        if (!config.dbConfig.connectionString) {
          setError('Por favor, forneça uma string de conexão com o banco de dados');
          return false;
        }
        if (!config.dbConfig.selectedTables.length) {
          setError('Por favor, selecione pelo menos uma tabela do banco de dados');
          return false;
        }
        break;
    }
    setError('');
    return true;
  }, [config]);

  const handleStepChange = useCallback((newStep: number) => {
    if (loading) return;
    
    if (newStep > step && !validateStep(step)) {
      return;
    }
    
    setStep(newStep);
  }, [step, loading, validateStep]);

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar chat');
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar chat');
    } finally {
      setLoading(false);
    }
  }, [config, loading, router, validateStep]);

  const handleCancel = useCallback(() => {
    if (loading) return;
    router.push('/dashboard');
  }, [loading, router]);

  const renderStepContent = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome do Chat
              </label>
              <input
                type="text"
                id="name"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                Avatar (Emoji)
              </label>
              <input
                type="text"
                id="avatar"
                value={config.avatar}
                onChange={(e) => updateConfig({ avatar: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="greeting" className="block text-sm font-medium text-gray-700">
                Mensagem de Boas-vindas
              </label>
              <textarea
                id="greeting"
                value={config.greeting}
                onChange={(e) => updateConfig({ greeting: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Cor Primária
              </label>
              <input
                type="color"
                id="primaryColor"
                value={config.appearance.primaryColor}
                onChange={(e) => updateConfig({
                  appearance: { ...config.appearance, primaryColor: e.target.value }
                })}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                Cor Secundária
              </label>
              <input
                type="color"
                id="secondaryColor"
                value={config.appearance.secondaryColor}
                onChange={(e) => updateConfig({
                  appearance: { ...config.appearance, secondaryColor: e.target.value }
                })}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="effect" className="block text-sm font-medium text-gray-700">
                Efeito Visual
              </label>
              <select
                id="effect"
                value={config.appearance.effect}
                onChange={(e) => updateConfig({
                  appearance: { ...config.appearance, effect: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            teste
            <div>
              <label htmlFor="aiProvider" className="block text-sm font-medium text-gray-700">
                Provedor de IA
              </label>
              <select
                id="aiProvider"
                value={config.behavior.aiProvider}
                onChange={(e) => updateConfig({
                  behavior: { ...config.behavior, aiProvider: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              >
                <option value="google">Google AI</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Modelo
              </label>
              <select
                id="model"
                value={config.behavior.model}
                onChange={(e) => updateConfig({
                  behavior: { ...config.behavior, model: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Temperatura
              </label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={config.behavior.temperature}
                onChange={(e) => updateConfig({
                  behavior: { ...config.behavior, temperature: parseFloat(e.target.value) }
                })}
                className="mt-1 block w-full"
              />
              <span className="text-sm text-gray-500">{config.behavior.temperature}</span>
            </div>

            <div>
              <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700">
                Máximo de Tokens
              </label>
              <input
                type="number"
                id="maxTokens"
                min="50"
                max="500"
                value={config.behavior.maxTokens}
                onChange={(e) => updateConfig({
                  behavior: { ...config.behavior, maxTokens: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <DatabaseSelector
              connectionString={config.dbConfig.connectionString}
              selectedTables={config.dbConfig.selectedTables}
              onConnectionStringChange={(value) => updateConfig({
                dbConfig: { ...config.dbConfig, connectionString: value }
              })}
              onTablesChange={(tables) => updateConfig({
                dbConfig: { ...config.dbConfig, selectedTables: tables }
              })}
            />
          </div>
        );

      default:
        return null;
    }
  }, [step, config, updateConfig]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Criar Novo Chat</h2>
        </div>

        <div className="mb-8">
          <ChatStepper
            steps={steps}
            currentStep={step}
            onStepChange={handleStepChange}
            disabled={loading}
          />
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {renderStepContent}

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-100"
            >
              Cancelar
            </button>

            <div className="flex space-x-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => handleStepChange(step - 1)}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-100"
                >
                  Anterior
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleStepChange(step + 1)}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-400"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-400"
                >
                  {loading ? 'Criando...' : 'Criar Chat'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 