"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthError extends Error {
  code?: string;
}

export default function AdminLayout({
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
        const userRole = localStorage.getItem('userRole');
        
        console.log('Estado inicial:', { token, userRole, pathname });
        
        // Se não há token, aguarda um pouco para dar tempo do login processar
        if (!token || !userRole) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryToken = localStorage.getItem('token');
          const retryRole = localStorage.getItem('userRole');
          
          console.log('Retry estado:', { retryToken, retryRole });
          
          if (!retryToken || !retryRole) {
            const error = new Error('Não autenticado após retry') as AuthError;
            error.code = 'NO_AUTH';
            throw error;
          }
        }

        const finalToken = localStorage.getItem('token');
        const finalRole = localStorage.getItem('userRole');

        if (finalRole !== 'admin') {
          const error = new Error('Acesso restrito - Área Administrativa') as AuthError;
          error.code = 'NOT_ADMIN';
          throw error;
        }

        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${finalToken}`,
          },
        });

        const data = await response.json();
        console.log('Resposta da verificação:', data);

        if (!response.ok || data.error || data.role !== 'admin') {
          const error = new Error('Verificação falhou') as AuthError;
          error.code = 'VERIFY_FAILED';
          throw error;
        }

        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro de autenticação:', error);
        
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Tipagem segura do erro
          const authError = error as AuthError;
          
          // Só limpa o localStorage para erros de autenticação
          if (authError.code === 'NO_AUTH') {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
          }
          
          if (pathname?.startsWith('/admin')) {
            router.push('/');
          }
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  // Mostra loading apenas durante a verificação inicial
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
          Acesso Negado
        </h2>
        <p className="text-gray-600">
          Você não tem permissão para acessar esta área.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Voltar para Login
        </button>
      </div>
    </div>
  );
} 