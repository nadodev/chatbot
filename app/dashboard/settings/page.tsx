'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    aiProvider: 'google',
    googleApiKey: '',
    openaiApiKey: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Carregar configurações existentes
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            aiProvider: data.aiProvider || 'google',
            googleApiKey: data.googleApiKey || '',
            openaiApiKey: data.openaiApiKey || '',
          });
        }
      })
      .catch(error => {
        console.error('Erro ao carregar configurações:', error);
        toast.error('Erro ao carregar configurações');
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso');
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Provedor de IA</label>
            <Select
              value={settings.aiProvider}
              onValueChange={(value) => setSettings({ ...settings, aiProvider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.aiProvider === 'google' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chave de API do Google</label>
              <Input
                type="password"
                value={settings.googleApiKey}
                onChange={(e) => setSettings({ ...settings, googleApiKey: e.target.value })}
                placeholder="Insira sua chave de API do Google"
              />
            </div>
          )}

          {settings.aiProvider === 'openai' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chave de API da OpenAI</label>
              <Input
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                placeholder="Insira sua chave de API da OpenAI"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 