import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreData() {
  try {
    // Encontrar o arquivo de backup mais recente
    const backupDir = path.join(process.cwd(), 'backups');
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('Nenhum arquivo de backup encontrado');
      return;
    }

    const latestBackup = files[0];
    console.log(`Restaurando backup: ${latestBackup}`);

    // Ler arquivo de backup
    const backupData = JSON.parse(
      fs.readFileSync(path.join(backupDir, latestBackup), 'utf-8')
    );

    // Restaurar produtos
    if (backupData.data.products.length > 0) {
      await prisma.products.createMany({
        data: backupData.data.products.map((product: any) => ({
          ...product,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
        })),
      });
    }

    // Restaurar FAQs
    if (backupData.data.faqs.length > 0) {
      await prisma.fAQ.createMany({
        data: backupData.data.faqs.map((faq: any) => ({
          ...faq,
          createdAt: new Date(faq.createdAt),
          updatedAt: new Date(faq.updatedAt),
        })),
      });
    }

    // Restaurar chats e suas relações
    for (const chat of backupData.data.chats) {
      // Criar chat
      const createdChat = await prisma.chat.create({
        data: {
          id: chat.id,
          name: chat.name,
          status: chat.status,
          avatar: chat.avatar,
          greeting: chat.greeting,
          appearance: chat.appearance,
          behavior: chat.behavior,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          // Temporariamente atribuir a um usuário admin
          userId: 'admin', // Será atualizado depois
        },
      });

      // Restaurar sources
      if (chat.sources.length > 0) {
        await prisma.chatSource.createMany({
          data: chat.sources.map((source: any) => ({
            ...source,
            createdAt: new Date(source.createdAt),
            updatedAt: new Date(source.updatedAt),
          })),
        });
      }

      // Restaurar mensagens
      if (chat.messages.length > 0) {
        await prisma.message.createMany({
          data: chat.messages.map((message: any) => ({
            ...message,
            createdAt: new Date(message.createdAt),
            updatedAt: new Date(message.updatedAt),
          })),
        });
      }

      // Restaurar configuração
      if (chat.config) {
        await prisma.chatConfig.create({
          data: {
            ...chat.config,
            createdAt: new Date(chat.config.createdAt),
            updatedAt: new Date(chat.config.updatedAt),
          },
        });
      }
    }

    console.log('Dados restaurados com sucesso!');
  } catch (error) {
    console.error('Erro ao restaurar dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData(); 