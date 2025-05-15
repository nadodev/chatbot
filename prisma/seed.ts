import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar configurações iniciais
    await prisma.$executeRaw`INSERT INTO Settings (id, aiProvider, googleApiKey, openaiApiKey, createdAt, updatedAt) 
      VALUES (1, 'google', '', '', NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
      aiProvider = VALUES(aiProvider),
      updatedAt = NOW()`;

    console.log('Configurações iniciais criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar configurações:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 