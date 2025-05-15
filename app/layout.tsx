import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Merriweather } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatHistoryProvider } from './contexts/ChatHistoryContext';
import { ChatWidgetProvider } from './contexts/ChatWidgetContext';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "A customizable chat widget for your website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable}`}
    >
      <body className="font-sans">
        <SettingsProvider>
          <ThemeProvider>
            <AuthProvider>
              <ChatHistoryProvider>
                <ChatWidgetProvider>
                  {children}
                  <Toaster />
                </ChatWidgetProvider>
              </ChatHistoryProvider>
            </AuthProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
