import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import prisma from './db';

interface SettingsData {
  id: number;
  aiProvider: string;
  googleApiKey: string | null;
  openaiApiKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

class AIService {
  private static instance: AIService;
  private googleAI: GoogleGenerativeAI | null = null;
  private openAI: OpenAI | null = null;
  private currentProvider: 'google' | 'openai' = 'google';
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const settings = await prisma.$queryRaw<SettingsData[]>`SELECT * FROM Settings LIMIT 1`;
      const settingsData = settings[0];
      
      if (!settingsData) {
        throw new Error('Configurações de IA não encontradas');
      }

      this.currentProvider = settingsData.aiProvider as 'google' | 'openai';

      // Inicializar o provedor selecionado
      if (this.currentProvider === 'google' && settingsData.googleApiKey) {
        this.googleAI = new GoogleGenerativeAI(settingsData.googleApiKey);
      } else if (this.currentProvider === 'openai' && settingsData.openaiApiKey) {
        this.openAI = new OpenAI({
          apiKey: settingsData.openaiApiKey
        });
      } else {
        throw new Error(`Chave de API não encontrada para o provedor ${this.currentProvider}`);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar serviço de IA:', error);
      throw error;
    }
  }

  public async generateResponse(prompt: string): Promise<{ text: string }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.currentProvider === 'google' && this.googleAI) {
        const model = this.googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { text: response.text() };
      } else if (this.currentProvider === 'openai' && this.openAI) {
        const completion = await this.openAI.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo',
        });
        return { text: completion.choices[0]?.message?.content || '' };
      } else {
        throw new Error('Nenhum provedor de IA inicializado');
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      throw error;
    }
  }
}

export const aiService = AIService.getInstance(); 