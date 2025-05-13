"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PricingModal from './components/PricingModal';

const plans = [
  {
    name: 'Gratuito',
    price: 0,
    features: [
      '1 chatbot',
      'Até 100 mensagens/mês',
      'Personalização básica'
    ]
  },
  {
    name: 'Pro',
    price: 49,
    features: [
      'Tudo do plano Gratuito',
      'Mensagens ilimitadas',
      'Personalização avançada',
      'Suporte prioritário'
    ]
  },
  {
    name: 'Empresarial',
    price: 149,
    features: [
      'Tudo do plano Pro',
      'Treinamento personalizado',
      'Acesso à API',
      'Suporte dedicado'
    ]
  }
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'benefits', 'use-cases', 'installation', 'pricing', 'faq'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-blue-100 overflow-x-hidden">
      {/* Navigation Menu */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-sm animate-slide-up">
                Chat App
              </span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'benefits', 'use-cases', 'installation', 'pricing', 'faq'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeSection === section
                      ? 'text-violet-600 underline underline-offset-8 decoration-2'
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
              <Link
                href="/chat"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-md hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all"
              >
                Experimentar
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500"
              >
                <span className="sr-only">Abrir menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['home', 'benefits', 'use-cases', 'installation', 'pricing', 'faq'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeSection === section
                      ? 'text-violet-600 bg-violet-50 underline underline-offset-8 decoration-2'
                      : 'text-gray-600 hover:text-violet-600 hover:bg-gray-50'
                  }`}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
              <Link
                href="/chat"
                className="block w-full text-center px-3 py-2 rounded-full text-base font-medium text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-md hover:from-violet-700 hover:to-blue-600"
              >
                Experimentar
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-60 blur-2xl z-0 overflow-x-hidden" aria-hidden>
          <div className="w-[600px] max-w-[100vw] h-[600px] bg-gradient-to-br from-violet-300 via-blue-200 to-transparent rounded-full absolute -top-40 -left-40 animate-fade-in" />
          <div className="w-[400px] max-w-[100vw] h-[400px] bg-gradient-to-br from-blue-200 via-violet-100 to-transparent rounded-full absolute top-40 right-0 animate-fade-in" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center animate-slide-up">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight drop-shadow-xl">
              Transforme seu Atendimento com{' '}
              <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">Chatbots Inteligentes</span>
            </h1>
            <p className="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto animate-fade-in">
              Automatize seu atendimento ao cliente com nossa solução de chatbot alimentada por IA. <br />
              <span className="text-violet-600 font-semibold">Forneça suporte instantâneo, automatize respostas e escale seu negócio com eficiência.</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-xl hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all transform hover:scale-105 active:scale-95"
              >
                Começar Agora
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center px-10 py-4 border border-gray-300 text-lg font-semibold rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-md transition-all transform hover:scale-105 active:scale-95"
              >
                Ver Demo
              </a>
            </div>
          </div>
          {/* Demo Video */}
          <div className="mt-20 max-w-4xl mx-auto animate-fade-in">
            <div className="aspect-w-16 aspect-h-9 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 transform hover:scale-[1.02] transition-transform duration-300">
              <video
                className="w-full h-full object-cover"
                poster="/demo-poster.jpg"
                controls
              >
                <source src="/demo.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gradient-to-br from-white via-violet-50 to-blue-100 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 animate-slide-up">Por que Escolher Nossa Solução?</h2>
            <p className="mt-4 text-xl text-gray-600 animate-fade-in">
              Experimente o poder do atendimento ao cliente impulsionado por IA
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Learning */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 animate-bounce group-hover:animate-none">
                <Image src="/benefits/learning.svg" alt="Learning" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Aprendizado Inteligente</h3>
              <p className="text-gray-600">
                Nossa IA aprende continuamente com as interações para fornecer respostas melhores e aumentar a satisfação do cliente.
              </p>
            </div>
            {/* Support */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-100 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 animate-bounce group-hover:animate-none">
                <Image src="/benefits/support.svg" alt="Support" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suporte 24/7</h3>
              <p className="text-gray-600">
                Forneça suporte instantâneo aos seus clientes a qualquer hora, em qualquer lugar, com respostas automatizadas e transferência para humanos.
              </p>
            </div>
            {/* Customization */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-200 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 animate-bounce group-hover:animate-none">
                <Image src="/benefits/customization.svg" alt="Customization" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personalização Fácil</h3>
              <p className="text-gray-600">
                Personalize a interface do chat, respostas e comportamento para corresponder à sua marca e necessidades de negócios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 animate-slide-up">Perfeito para Diferentes Casos de Uso</h2>
            <p className="mt-4 text-xl text-gray-600 animate-fade-in">
              Da educação ao atendimento ao cliente, nossa solução de chat se adapta às suas necessidades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Courses */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 animate-bounce group-hover:animate-none">
                <Image src="/use-cases/courses.svg" alt="Courses" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cursos Online</h3>
              <p className="text-gray-600">
                Forneça respostas instantâneas às dúvidas dos alunos e automatize o suporte relacionado aos cursos.
              </p>
            </div>
            {/* Support */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-100 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 animate-bounce group-hover:animate-none">
                <Image src="/use-cases/support.svg" alt="Support" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Atendimento ao Cliente</h3>
              <p className="text-gray-600">
                Gerencie consultas comuns dos clientes e forneça suporte instantâneo para seus produtos e serviços.
              </p>
            </div>
            {/* Consulting */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-200 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 animate-bounce group-hover:animate-none">
                <Image src="/use-cases/consulting.svg" alt="Consulting" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Consultoria Empresarial</h3>
              <p className="text-gray-600">
                Automatize consultas iniciais e forneça respostas rápidas para perguntas comuns de negócios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section id="installation" className="py-24 bg-gradient-to-br from-white via-violet-50 to-blue-100 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 animate-slide-up">Instalação Fácil</h2>
            <p className="mt-4 text-xl text-gray-600 animate-fade-in">
              Comece em minutos com nosso processo de configuração simples
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 animate-bounce group-hover:animate-none">
                <Image src="/installation/copy.svg" alt="Copy" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Copie o Código</h3>
              <p className="text-gray-600">
                Copie nosso snippet de código do widget de chat pronto para uso.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-100 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 animate-bounce group-hover:animate-none">
                <Image src="/installation/paste.svg" alt="Paste" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cole no Seu Site</h3>
              <p className="text-gray-600">
                Adicione o código ao HTML do seu site, logo antes da tag de fechamento do body.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-200 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 animate-bounce group-hover:animate-none">
                <Image src="/installation/ready.svg" alt="Ready" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pronto para Usar!</h3>
              <p className="text-gray-600">
                Seu widget de chat agora está ativo e pronto para ajudar seus clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Preços Simples e Transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para você
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="bg-white rounded-2xl shadow-xl p-8 relative hover:shadow-2xl transition-all transform hover:scale-105"
              >
                {plan.name === 'Pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      R${plan.price}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-violet-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-md hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all transform hover:scale-105 active:scale-95"
                  >
                    Começar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gradient-to-br from-white via-violet-50 to-blue-100 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 animate-slide-up">Perguntas Frequentes</h2>
            <p className="mt-4 text-xl text-gray-600 animate-fade-in">
              Encontre respostas para perguntas comuns sobre nossa solução de chat
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {/* FAQ Item 1 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Como funciona o chat com IA?</h3>
                <p className="text-gray-600">
                  Nosso chat com IA usa processamento avançado de linguagem natural para entender e responder às consultas dos clientes. Ele aprende com as interações para fornecer respostas mais precisas e úteis ao longo do tempo.
                </p>
              </div>
              {/* FAQ Item 2 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in delay-100 hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Posso personalizar o widget de chat?</h3>
                <p className="text-gray-600">
                  Sim! Você pode personalizar a aparência, comportamento e respostas do widget de chat para corresponder à sua marca e necessidades de negócios. Nossos planos Pro e Empresarial oferecem opções avançadas de personalização.
                </p>
              </div>
              {/* FAQ Item 3 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in delay-200 hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Existe um limite para o número de mensagens?</h3>
                <p className="text-gray-600">
                  O plano Gratuito inclui até 100 mensagens por mês. Os planos Pro e Empresarial oferecem mensagens ilimitadas para lidar com todas as suas interações com clientes.
                </p>
              </div>
              {/* FAQ Item 4 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in delay-300 hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Como começar?</h3>
                <p className="text-gray-600">
                  Começar é fácil! Basta se inscrever em um plano, copiar o snippet de código fornecido e colá-lo em seu site. O widget de chat estará ativo e pronto para uso em minutos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-violet-700 via-blue-800 to-blue-900 text-white py-16 animate-fade-in mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-wide">Chat App</h3>
              <p className="text-gray-200/80 mb-4">
                Transforme seu atendimento ao cliente com soluções de chat alimentadas por IA.
              </p>
              <span className="inline-block w-12 h-1 rounded-full bg-gradient-to-r from-violet-400 to-blue-400 mb-2"></span>
            </div>
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-wide">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#home" className="text-gray-200 hover:text-white transition-colors">Início</a>
                </li>
                <li>
                  <a href="#benefits" className="text-gray-200 hover:text-white transition-colors">Benefícios</a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-200 hover:text-white transition-colors">Preços</a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-200 hover:text-white transition-colors">FAQ</a>
                </li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-wide">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">Documentação</a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">Referência da API</a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">Suporte</a>
                </li>
              </ul>
            </div>
            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-wide">Fique Atualizado</h3>
              <p className="text-gray-200/80 mb-4">
                Inscreva-se em nossa newsletter para as últimas atualizações e recursos.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Digite seu email"
                  className="flex-1 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-r-md hover:from-violet-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                >
                  Inscrever
                </button>
              </form>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-violet-900/40 text-center text-gray-200/80">
            <p>&copy; 2024 Chat App. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {selectedPlan && (
        <PricingModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan}
        />
      )}
    </main>
  );
}
