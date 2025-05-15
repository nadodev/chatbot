import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppearanceSettings from '@/components/AppearanceSettings';
import { toast } from 'sonner';

interface ChatConfig {
  name: string;
  avatar: string;
  greeting: string;
  appearance: {
    primaryColor: string;
    userBubbleColor: string;
    aiBubbleColor: string;
    font: string;
    position: string;
    animation: string;
    darkMode: boolean;
  };
}

const defaultConfig: ChatConfig = {
  name: 'Novo Chat',
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

interface ChatWizardProps {
  initialConfig?: ChatConfig;
  onSave: (config: ChatConfig) => Promise<void>;
  onCancel: () => void;
}

export default function ChatWizard({ initialConfig, onSave, onCancel }: ChatWizardProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ChatConfig>(initialConfig || defaultConfig);
  const [loading, setLoading] = useState(false);

  const handleBasicInfoChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAppearanceChange = (newConfig: ChatConfig) => {
    setConfig(newConfig);
  };

  const handleNext = () => {
    if (step === 1 && !config.name.trim()) {
      toast.error('Por favor, insira um nome para o chat');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSave(config);
      toast.success('Chat salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar o chat');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`h-2 w-full rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
          <div className={`h-2 w-full rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-primary' : 'text-gray-500'}>Informações Básicas</span>
          <span className={step >= 2 ? 'text-primary' : 'text-gray-500'}>Aparência</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Chat</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                placeholder="Ex: Assistente de Suporte"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar (URL ou emoji)</Label>
              <Input
                id="avatar"
                value={config.avatar}
                onChange={(e) => handleBasicInfoChange('avatar', e.target.value)}
                placeholder="URL da imagem ou emoji"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="greeting">Mensagem de Boas-vindas</Label>
              <Input
                id="greeting"
                value={config.greeting}
                onChange={(e) => handleBasicInfoChange('greeting', e.target.value)}
                placeholder="Ex: Olá! Como posso ajudar?"
              />
            </div>
          </div>
        ) : (
          <AppearanceSettings config={config} onUpdate={handleAppearanceChange} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={step === 1 ? onCancel : handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </button>
        <button
          onClick={step === 2 ? handleSubmit : handleNext}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : step === 2 ? 'Salvar' : 'Próximo'}
        </button>
      </div>
    </div>
  );
} 