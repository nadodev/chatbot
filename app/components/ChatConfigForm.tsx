import { useState, useEffect } from 'react';

interface ChatConfigFormProps {
  chatId: string;
  onClose: () => void;
}

interface ConfigData {
  aiProvider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

const modelOptions = {
  google: ['gemini-1.5-flash', 'gemini-1.0-pro'],
  openai: ['gpt-4-turbo', 'gpt-3.5-turbo']
};

export default function ChatConfigForm({ chatId, onClose }: ChatConfigFormProps) {
  const [config, setConfig] = useState<ConfigData>({
    aiProvider: 'google',
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 150
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Carregar configurações existentes
    fetch(`/api/chat/${chatId}/config`)
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          setConfig(data.config);
        }
      })
      .catch(error => console.error('Erro ao carregar configurações:', error));
  }, [chatId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/chat/${chatId}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        onClose();
      } else {
        console.error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Provedor de IA
        </label>
        <select
          value={config.aiProvider}
          onChange={(e) => setConfig({
            ...config,
            aiProvider: e.target.value,
            model: modelOptions[e.target.value as keyof typeof modelOptions][0]
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="google">Google AI</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Modelo
        </label>
        <select
          value={config.model}
          onChange={(e) => setConfig({ ...config, model: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {modelOptions[config.aiProvider as keyof typeof modelOptions].map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Temperatura
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={config.temperature}
          onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
          className="mt-1 block w-full"
        />
        <div className="mt-1 text-sm text-gray-500 text-right">
          {config.temperature}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Máximo de Tokens
        </label>
        <input
          type="number"
          min="1"
          max="2048"
          value={config.maxTokens}
          onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
} 