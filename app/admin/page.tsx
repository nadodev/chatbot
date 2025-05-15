"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/app/components/UserManagement';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Recupera o token do localStorage quando o componente monta
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Painel de Administração
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sair
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <UserManagement token={token} />
          </div>
        </div>
      </div>
    </div>
  );
} 