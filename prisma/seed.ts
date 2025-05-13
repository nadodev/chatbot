import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes
  await prisma.fAQ.deleteMany();

  // Inserir FAQs
  const faqs = [
    {
      "question": "Como funciona o sistema de chat?",
      "answer": "Nosso sistema de chat utiliza inteligência artificial avançada para fornecer respostas automáticas 24/7. Ele pode ser personalizado com sua base de conhecimento e integrado facilmente ao seu site através de um widget simples.",
      "category": "general"
    },
    {
      "question": "Para quem o chatbot é indicado?",
      "answer": "Nosso chatbot é ideal para empresas que desejam automatizar o atendimento, capturar leads ou responder dúvidas frequentes, especialmente em sites de e-commerce, serviços, SaaS e educação.",
      "category": "general"
    },
    {
      "question": "Preciso saber programar para usar o chatbot?",
      "answer": "Não! Nosso painel foi pensado para ser intuitivo e não requer conhecimento técnico. Você pode configurar tudo visualmente e gerar o código de integração com um clique.",
      "category": "general"
    },
    {
      "question": "Quais são os planos disponíveis?",
      "answer": "Oferecemos três planos: Gratuito (1 chatbot, 100 mensagens/mês), Pro (mensagens ilimitadas, personalização avançada) e Empresarial (tudo do Pro + treinamento personalizado e suporte dedicado).",
      "category": "pricing"
    },
    {
      "question": "O que acontece após o período de teste gratuito?",
      "answer": "Após os 7 dias de teste, o acesso ao painel e ao chatbot é pausado. Você poderá entrar em contato com nossa equipe para ativar um plano e continuar usando o serviço.",
      "category": "pricing"
    },
    {
      "question": "Posso mudar de plano depois de contratar?",
      "answer": "Sim! Você pode alterar ou cancelar seu plano a qualquer momento, diretamente pelo painel ou com o apoio da nossa equipe.",
      "category": "pricing"
    },
    {
      "question": "Como posso integrar o chat ao meu site?",
      "answer": "A integração é simples! Basta adicionar um pequeno snippet de código ao seu site. Você receberá um código personalizado após se registrar, que pode ser colado antes do fechamento da tag </body> do seu HTML.",
      "category": "technical"
    },
    {
      "question": "Como o chatbot aprende?",
      "answer": "O chatbot utiliza machine learning para melhorar continuamente suas respostas. Ele aprende com as interações dos usuários e pode ser treinado com sua base de conhecimento específica.",
      "category": "technical"
    },
    {
      "question": "É possível conectar meu banco de dados ao chatbot?",
      "answer": "Sim! Você pode conectar uma base de dados estruturada via API ou arquivos CSV, para que o chatbot utilize essas informações como fonte de conhecimento.",
      "category": "technical"
    },
    {
      "question": "O chat tem suporte a streaming de mensagens?",
      "answer": "Sim, utilizamos streaming para entregar as respostas da IA em tempo real, simulando uma conversa fluida e mais humana com o visitante.",
      "category": "technical"
    },
    {
      "question": "O chatbot pode ser personalizado?",
      "answer": "Sim! Você pode personalizar a aparência, respostas, tom de voz e comportamento do chatbot. Nos planos Pro e Empresarial, você tem acesso a recursos avançados de personalização.",
      "category": "features"
    },
    {
      "question": "Posso ver as conversas anteriores?",
      "answer": "Sim! Todas as conversas são armazenadas e podem ser acessadas através do painel de controle. Você pode ver o histórico completo, métricas e insights sobre as interações.",
      "category": "features"
    },
    {
      "question": "O chatbot funciona em múltiplos idiomas?",
      "answer": "Sim! O chatbot suporta múltiplos idiomas e pode ser configurado para responder em diferentes línguas. Você pode definir o idioma padrão e adicionar suporte para outros idiomas conforme necessário.",
      "category": "features"
    },
    {
      "question": "Posso acompanhar os leads que interagem com o chatbot?",
      "answer": "Sim! O painel exibe dados de leads capturados, horários, localização e o conteúdo das interações. Isso facilita o acompanhamento de oportunidades.",
      "category": "features"
    },
    {
      "question": "É possível configurar ações automáticas?",
      "answer": "Sim. Você pode criar fluxos que, por exemplo, redirecionam para uma página, enviam e-mails ou coletam dados após determinada pergunta.",
      "category": "features"
    },
    {
      "question": "Existe suporte técnico disponível?",
      "answer": "Sim! Oferecemos suporte por email para todos os planos. Os planos Pro e Empresarial incluem suporte prioritário e dedicado, respectivamente.",
      "category": "support"
    },
    {
      "question": "Tenho ajuda para configurar meu primeiro chatbot?",
      "answer": "Sim! Durante o período de teste, você pode falar com nosso time de onboarding para tirar dúvidas e configurar seu primeiro assistente da melhor forma.",
      "category": "support"
    },
    {
      "question": "Existe suporte via WhatsApp?",
      "answer": "Sim! Clientes dos planos Empresarial e Pro têm acesso a suporte direto via WhatsApp, com resposta prioritária.",
      "category": "support"
    }
  ]
  ;

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 