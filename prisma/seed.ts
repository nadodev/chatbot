import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing products
  await prisma.products.deleteMany();

  // Add sample products
  const products = [
    {
      name: "Smartphone XYZ",
      description: "Último modelo com câmera de alta resolução e bateria de longa duração",
      price: 1999.99,
      in_stock: true
    },
    {
      name: "Notebook Pro",
      description: "Notebook potente para trabalho e jogos",
      price: 4999.99,
      in_stock: true
    },
    {
      name: "Smart TV 4K",
      description: "TV com resolução 4K e sistema operacional inteligente",
      price: 2999.99,
      in_stock: true
    },
    {
      name: "Fone de Ouvido Bluetooth",
      description: "Fone sem fio com cancelamento de ruído",
      price: 499.99,
      in_stock: true
    },
    {
      name: "Smartwatch",
      description: "Relógio inteligente com monitor cardíaco e GPS",
      price: 799.99,
      in_stock: false
    }
  ];

  for (const product of products) {
    await prisma.products.create({
      data: product
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 