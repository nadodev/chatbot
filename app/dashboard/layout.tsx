"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthError extends Error {
  code?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const hasPremium = localStorage.getItem('hasPremium') === 'true';
        
        console.log('Estado inicial dashboard:', { token, hasPremium, pathname });
        
        // Se não há token ou não é premium, aguarda um pouco para dar tempo do login processar
        if (!token || !hasPremium) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryToken = localStorage.getItem('token');
          const retryPremium = localStorage.getItem('hasPremium') === 'true';
          
          console.log('Retry estado dashboard:', { retryToken, retryPremium });
          
          if (!retryToken || !retryPremium) {
            const error = new Error('Não autenticado ou sem acesso premium') as AuthError;
            error.code = 'NO_AUTH';
            throw error;
          }
        }

        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('Resposta da verificação dashboard:', data);

        if (!response.ok || data.error || !data.subscription?.isActive) {
          const error = new Error('Verificação falhou - Acesso Premium Necessário') as AuthError;
          error.code = 'VERIFY_FAILED';
          throw error;
        }

        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro de autenticação dashboard:', error);
        
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Tipagem segura do erro
          const authError = error as AuthError;
          
          // Limpar dados de autenticação apenas se não estiver autenticado
          if (authError.code === 'NO_AUTH') {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('hasPremium');
          }
          
          if (pathname?.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  // Mostra loading durante a verificação inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Carregando...</div>
      </div>
    );
  }

  // Se estiver autenticado, renderiza o conteúdo
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Se não estiver autenticado, mostra mensagem
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Acesso Premium Necessário
        </h2>
        <p className="text-gray-600">
          Esta área é exclusiva para usuários premium.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Fazer Login
        </button>
      </div>
    </div>
  );
} 