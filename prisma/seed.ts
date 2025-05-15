import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  try {
    // Limpar dados existentes
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️ Dados anteriores removidos');

    // Criar usuários administradores
    const admin1 = await prisma.user.create({
      data: {
        name: 'Admin Principal',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        subscription: {
          create: {
            startDate: new Date(),
            endDate: addDays(new Date(), 365), // 1 ano de assinatura
            isActive: true,
          },
        },
      },
    });

    const admin2 = await prisma.user.create({
      data: {
        name: 'Admin Secundário',
        email: 'admin2@example.com',
        password: await bcrypt.hash('admin456', 10),
        role: 'admin',
        subscription: {
          create: {
            startDate: new Date(),
            endDate: addDays(new Date(), 365),
            isActive: true,
          },
        },
      },
    });

    console.log('👑 Administradores criados:', { admin1: admin1.email, admin2: admin2.email });

    // Criar usuários normais com diferentes estados de assinatura
    const user1 = await prisma.user.create({
      data: {
        name: 'Usuário Premium Ativo',
        email: 'premium@example.com',
        password: await bcrypt.hash('user123', 10),
        role: 'user',
        subscription: {
          create: {
            startDate: new Date(),
            endDate: addDays(new Date(), 30), // 30 dias de assinatura
            isActive: true,
          },
        },
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Usuário Trial',
        email: 'trial@example.com',
        password: await bcrypt.hash('user456', 10),
        role: 'user',
        subscription: {
          create: {
            startDate: new Date(),
            endDate: addDays(new Date(), 7), // 7 dias de trial
            isActive: true,
          },
        },
      },
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Usuário Expirado',
        email: 'expired@example.com',
        password: await bcrypt.hash('user789', 10),
        role: 'user',
        subscription: {
          create: {
            startDate: addDays(new Date(), -30), // Começou há 30 dias
            endDate: addDays(new Date(), -1), // Terminou ontem
            isActive: false,
          },
        },
      },
    });

    const user4 = await prisma.user.create({
      data: {
        name: 'Usuário Sem Assinatura',
        email: 'free@example.com',
        password: await bcrypt.hash('user000', 10),
        role: 'user',
      },
    });

    console.log('👥 Usuários criados:', {
      premium: user1.email,
      trial: user2.email,
      expired: user3.email,
      free: user4.email,
    });

    console.log('\n📝 Credenciais para teste:');
    console.log('-------------------');
    console.log('Admin Principal:');
    console.log('Email: admin@example.com');
    console.log('Senha: admin123');
    console.log('-------------------');
    console.log('Usuário Premium:');
    console.log('Email: premium@example.com');
    console.log('Senha: user123');
    console.log('-------------------');
    console.log('Usuário Trial:');
    console.log('Email: trial@example.com');
    console.log('Senha: user456');
    console.log('-------------------');

  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 