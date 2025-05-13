import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatHistoryProvider } from './contexts/ChatHistoryContext';
import { ChatWidgetProvider } from './contexts/ChatWidgetContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat App",
  description: "Um chat moderno e interativo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SettingsProvider>
          <ThemeProvider>
            <AuthProvider>
              <ChatHistoryProvider>
                <ChatWidgetProvider>
                  {children}
                </ChatWidgetProvider>
              </ChatHistoryProvider>
            </AuthProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
