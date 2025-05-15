import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backupData() {
  try {
    // Buscar todos os dados
    const chats = await prisma.chat.findMany({
      include: {
        sources: true,
        messages: true,
        config: true,
      },
    });

    const products = await prisma.products.findMany();
    const faqs = await prisma.fAQ.findMany();

    // Criar objeto com todos os dados
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        chats,
        products,
        faqs,
      },
    };

    // Criar diretório de backup se não existir
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Salvar arquivo de backup
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(
      path.join(backupDir, filename),
      JSON.stringify(backup, null, 2)
    );

    console.log(`Backup criado com sucesso: ${filename}`);
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupData(); 