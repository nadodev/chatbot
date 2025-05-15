'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  isLoading: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: true,
        isLoading: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 