"use client";

import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                Configurações
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 