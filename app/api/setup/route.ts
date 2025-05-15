import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    // Verificar se já existem configurações
    const existingSettings = await prisma.$queryRaw`SELECT id FROM Settings LIMIT 1`;
    
    if (!existingSettings || (Array.isArray(existingSettings) && existingSettings.length === 0)) {
      // Criar configurações iniciais apenas se não existirem
      await prisma.$executeRaw`INSERT INTO Settings (id, aiProvider, googleApiKey, openaiApiKey, createdAt, updatedAt) 
        VALUES (1, 'google', '', '', NOW(), NOW())`;
      
      return NextResponse.json({ message: 'Configurações inicializadas com sucesso' });
    }
    
    return NextResponse.json({ message: 'Configurações já existem' });
  } catch (error) {
    console.error('Erro ao inicializar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar configurações' },
      { status: 500 }
    );
  }
} 