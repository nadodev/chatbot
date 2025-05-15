"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PricingModal from './components/PricingModal';
import DemoModal from './components/DemoModal';
import CodeModal from './components/CodeModal';
import FAQModal from './components/FAQModal';
import FAQChat from './components/FAQChat';

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
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);

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
              Atendimento Inteligente para seu Negócio{' '}
              <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">24 Horas por Dia</span>
            </h1>
            <p className="text-2xl text-gray-700 mb-6 max-w-3xl mx-auto animate-fade-in">
              Automatize seu atendimento ao cliente com nossa solução de chatbot alimentada por IA.
            </p>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in">
              <span className="text-violet-600 font-semibold">Responda perguntas, resolva problemas e aumente a satisfação dos seus clientes</span> com um assistente virtual que aprende e melhora a cada interação.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-xl hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all transform hover:scale-105 active:scale-95"
              >
                Experimente Agora
              </Link>
              <a
                href="#demo"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDemoModalOpen(true);
                }}
                className="inline-flex items-center justify-center px-10 py-4 border border-gray-300 text-lg font-semibold rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-md transition-all transform hover:scale-105 active:scale-95"
              >
                Ver Demonstração
              </a>
            </div>
          </div>

          {/* Demonstração Interativa */}
          <div className="mt-20 max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Veja como funciona:</h3>
                <p className="text-gray-600">Let&apos;s get started with your chatbot</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white font-semibold">IA</div>
                  <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-700">Olá! Sou o assistente virtual da sua empresa. Como posso ajudar você hoje?</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">U</div>
                  <div className="flex-1 bg-violet-50 rounded-2xl p-4">
                    <p className="text-gray-700">Quais são os horários de atendimento?</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white font-semibold">IA</div>
                  <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-700">Nosso atendimento está disponível 24 horas por dia, 7 dias por semana! Posso ajudar com:</p>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Dúvidas sobre produtos</li>
                      <li>• Suporte técnico</li>
                      <li>• Informações de pedidos</li>
                      <li>• E muito mais!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-white via-violet-50 to-blue-100 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 animate-slide-up">
              Como Funciona
              <span className="block text-2xl mt-2 text-violet-600">Três passos simples para transformar seu atendimento</span>
            </h2>
          </div>

          <div className="relative">
            {/* Linha de conexão */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-200 via-blue-200 to-violet-200 transform -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {/* Passo 1 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in group relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                    1
                  </div>
                </div>
                <div className="mt-8">
                  <div className="w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Configure seu Chatbot</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <svg className="w-5 h-5 text-violet-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-600">Base de conhecimento personalizada</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <svg className="w-5 h-5 text-violet-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-600">Tom de voz da sua marca</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <svg className="w-5 h-5 text-violet-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-600">Respostas automáticas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-100 group relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                    2
                  </div>
                </div>
                <div className="mt-8">
                  <div className="w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Integre ao Seu Site</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-6 group-hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-sm text-gray-500">chat-widget.js</span>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-gray-400 text-sm font-mono">
                          <span className="text-violet-400">window</span>.<span className="text-blue-400">chatConfig</span> = {'{'}
                          <br />
                          {'  '}<span className="text-green-400">apiKey</span>: <span className="text-yellow-400">'seu-api-key'</span>,
                          <br />
                          {'  '}<span className="text-green-400">theme</span>: <span className="text-yellow-400">'light'</span>
                          <br />{'}'};
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsCodeModalOpen(true)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Ver Código Completo
                    </button>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Integração em menos de 5 minutos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-200 group relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                    3
                  </div>
                </div>
                <div className="mt-8">
                  <div className="w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Monitore e Melhore</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <svg className="w-5 h-5 text-violet-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-600">Dashboard com métricas em tempo real</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <svg className="w-5 h-5 text-violet-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-600">Relatórios detalhados de desempenho</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <svg className="w-5 h-5 text-violet-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-600">Feedback dos clientes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 animate-slide-up">Por que Escolher Nossa Solução?</h2>
            <p className="mt-4 text-xl text-gray-600 animate-fade-in">
              Benefícios reais para seu negócio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Learning */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 animate-bounce group-hover:animate-none">
                <Image src="/benefits/learning.svg" alt="Learning" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Aprendizado Inteligente</h3>
              <p className="text-gray-600 mb-4">
                Nossa IA aprende continuamente com as interações para fornecer respostas melhores.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Melhoria contínua das respostas
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Adaptação ao seu negócio
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Análise de padrões de uso
                </li>
              </ul>
            </div>
            {/* Support */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-100 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 animate-bounce group-hover:animate-none">
                <Image src="/benefits/support.svg" alt="Support" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suporte 24/7</h3>
              <p className="text-gray-600 mb-4">
                Atendimento instantâneo para seus clientes a qualquer hora.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Respostas imediatas
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Transferência para humanos
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Suporte em múltiplos idiomas
                </li>
              </ul>
            </div>
            {/* Customization */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:scale-105 hover:shadow-2xl transition-all border border-violet-100 animate-fade-in delay-200 group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 animate-bounce group-hover:animate-none">
                <Image src="/benefits/customization.svg" alt="Customization" width={48} height={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personalização Fácil</h3>
              <p className="text-gray-600 mb-4">
                Adapte o chatbot à sua marca e necessidades.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Design personalizado
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Fluxos de conversação
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Integração com CRM
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos que Cabem no Seu Bolso
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Escolha o plano ideal para o seu negócio
            </p>
            <div className="flex justify-center space-x-4 mb-12">
              <button className="px-6 py-2 rounded-full bg-violet-100 text-violet-700 font-medium">
                Mensal
              </button>
              <button className="px-6 py-2 rounded-full bg-white text-gray-600 font-medium border border-gray-200">
                Anual <span className="text-violet-600">(Economize 20%)</span>
              </button>
            </div>
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
                      Mais Popular
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
                  <p className="text-gray-600 mb-8">
                    {plan.name === 'Gratuito' && 'Perfeito para começar'}
                    {plan.name === 'Pro' && 'Ideal para negócios em crescimento'}
                    {plan.name === 'Empresarial' && 'Solução completa para grandes empresas'}
                  </p>
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
      <section id="faq" className="py-20 bg-gradient-to-br from-white via-violet-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Tire suas dúvidas sobre nosso sistema de chat de forma interativa
            </p>
            <button
              onClick={() => setIsFAQModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-md hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Ver Todas as Perguntas
            </button>
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

      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      <FAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
      />

      {/* Chat flutuante */}
      <FAQChat />
    </main>
  );
}
