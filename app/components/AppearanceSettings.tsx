import { useState, useEffect, ChangeEvent } from 'react';
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ChatPreview from './ChatPreview';

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

interface AppearanceSettingsProps {
  config: ChatConfig;
  onUpdate: (config: ChatConfig) => void;
}

export default function AppearanceSettings({ config, onUpdate }: AppearanceSettingsProps) {
  const [localConfig, setLocalConfig] = useState<ChatConfig>(config);

  const handleChange = (field: string, value: string) => {
    const newConfig = {
      ...localConfig,
      [field]: value,
    };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  const handleAppearanceChange = (field: string, value: string) => {
    const newConfig = {
      ...localConfig,
      appearance: {
        ...localConfig.appearance,
        [field]: value,
      },
    };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Chat</Label>
          <Input
            id="name"
            value={localConfig.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
            placeholder="Ex: Assistente de Suporte"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">URL do Avatar (ou emoji)</Label>
          <Input
            id="avatar"
            value={localConfig.avatar}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('avatar', e.target.value)}
            placeholder="URL da imagem ou emoji"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="greeting">Mensagem de Boas-vindas</Label>
          <Input
            id="greeting"
            value={localConfig.greeting}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('greeting', e.target.value)}
            placeholder="Ex: Olá! Como posso ajudar?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryColor">Cor Principal</Label>
          <div className="flex gap-2">
            <Input
              id="primaryColor"
              type="color"
              value={localConfig.appearance.primaryColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleAppearanceChange('primaryColor', e.target.value)}
              className="w-12 h-12 p-1 rounded-lg"
            />
            <Input
              type="text"
              value={localConfig.appearance.primaryColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleAppearanceChange('primaryColor', e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userBubbleColor">Cor das Mensagens do Usuário</Label>
          <div className="flex gap-2">
            <Input
              id="userBubbleColor"
              type="color"
              value={localConfig.appearance.userBubbleColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleAppearanceChange('userBubbleColor', e.target.value)}
              className="w-12 h-12 p-1 rounded-lg"
            />
            <Input
              type="text"
              value={localConfig.appearance.userBubbleColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleAppearanceChange('userBubbleColor', e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aiBubbleColor">Cor das Mensagens do Assistente</Label>
          <div className="flex gap-2">
            <Input
              id="aiBubbleColor"
              type="color"
              value={localConfig.appearance.aiBubbleColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleAppearanceChange('aiBubbleColor', e.target.value)}
              className="w-12 h-12 p-1 rounded-lg"
            />
            <Input
              type="text"
              value={localConfig.appearance.aiBubbleColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleAppearanceChange('aiBubbleColor', e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Pré-visualização</h3>
        <ChatPreview config={localConfig} />
      </div>
    </div>
  );
} 