"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatStepper from '@/app/components/ChatStepper';
import DatabaseSelector from '@/app/components/DatabaseSelector';

interface ChatData {
  name: string;
  avatar: string;
  greeting: string;
  status: 'active' | 'paused';
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

export default function EditChat({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ChatData>({
    name: '',
    avatar: '🤖',
    greeting: '',
    status: 'active',
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

  useEffect(() => {
    fetchChat();
  }, [params.id]);

  const fetchChat = async () => {
    try {
      const response = await fetch(`/api/chats/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          avatar: data.avatar,
          greeting: data.greeting,
          status: data.status,
          appearance: data.appearance ? JSON.parse(data.appearance) : {
            primaryColor: '#6366f1',
            secondaryColor: '#4f46e5',
            effect: 'fade'
          },
          behavior: data.behavior ? JSON.parse(data.behavior) : {
            temperature: 0.7,
            maxTokens: 150,
            aiProvider: 'google',
            model: 'gemini-2.0-flash'
          },
          dbConfig: data.dbConfig ? JSON.parse(data.dbConfig) : {
            connectionString: '',
            selectedTables: []
          }
        });
        setLoading(false);
      } else {
        throw new Error('Chat não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar chat:', error);
      setError('Erro ao buscar chat');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/chats/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          appearance: JSON.stringify(formData.appearance),
          behavior: JSON.stringify(formData.behavior),
          dbConfig: JSON.stringify(formData.dbConfig)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar chat');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao atualizar chat:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar chat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepChange = (newStep: number) => {
    if (isSubmitting) return;
    setCurrentStep(newStep);
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    router.push('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                Avatar (Emoji)
              </label>
              <input
                type="text"
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="greeting" className="block text-sm font-medium text-gray-700">
                Mensagem de Boas-vindas
              </label>
              <textarea
                id="greeting"
                value={formData.greeting}
                onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'paused' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
              </select>
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
                value={formData.appearance.primaryColor}
                onChange={(e) => setFormData({
                  ...formData,
                  appearance: { ...formData.appearance, primaryColor: e.target.value }
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
                value={formData.appearance.secondaryColor}
                onChange={(e) => setFormData({
                  ...formData,
                  appearance: { ...formData.appearance, secondaryColor: e.target.value }
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
                value={formData.appearance.effect}
                onChange={(e) => setFormData({
                  ...formData,
                  appearance: { ...formData.appearance, effect: e.target.value }
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
            <div>
              <label htmlFor="aiProvider" className="block text-sm font-medium text-gray-700">
                Provedor de IA
              </label>
              <select
                id="aiProvider"
                value={formData.behavior.aiProvider}
                onChange={(e) => setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, aiProvider: e.target.value }
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
                value={formData.behavior.model}
                onChange={(e) => setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, model: e.target.value }
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
                value={formData.behavior.temperature}
                onChange={(e) => setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, temperature: parseFloat(e.target.value) }
                })}
                className="mt-1 block w-full"
              />
              <span className="text-sm text-gray-500">{formData.behavior.temperature}</span>
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
                value={formData.behavior.maxTokens}
                onChange={(e) => setFormData({
                  ...formData,
                  behavior: { ...formData.behavior, maxTokens: parseInt(e.target.value) }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Configuração do Banco de Dados</h3>
            <DatabaseSelector
              connectionString={formData.dbConfig.connectionString}
              selectedTables={formData.dbConfig.selectedTables}
              onConnectionStringChange={(value) => setFormData({
                ...formData,
                dbConfig: { ...formData.dbConfig, connectionString: value }
              })}
              onTablesChange={(tables) => setFormData({
                ...formData,
                dbConfig: { ...formData.dbConfig, selectedTables: tables }
              })}
              initialDbName={formData.dbConfig.connectionString?.split('@')[1]?.split('/')[1]}
              initialTables={formData.dbConfig.selectedTables}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Editar Chat</h2>
        </div>

        <div className="mb-8">
          <ChatStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {renderStepContent()}

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-100"
              >
                Cancelar
              </button>

              <div className="flex space-x-4">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => handleStepChange(currentStep - 1)}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-100"
                  >
                    Anterior
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => handleStepChange(currentStep + 1)}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-400"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-400"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 