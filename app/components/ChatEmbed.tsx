"use client";

import { useEffect, useState } from "react";

interface ChatEmbedProps {
  chatId?: string;
  showEmbedCode?: boolean;
}

export default function ChatEmbed({ chatId, showEmbedCode = false }: ChatEmbedProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Remove any existing chat widget
    const existingContainer = document.getElementById('chat-widget-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create and append the script
    const script = document.createElement("script");
    // Use the correct path based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3000';
    script.src = `${baseUrl}/chat-widget.js`;
    script.async = true;
    script.onload = () => {
      console.log('Chat widget script loaded successfully');
    };
    script.onerror = (error) => {
      console.error('Error loading chat widget script:', error);
    };
    document.body.appendChild(script);

    return () => {
      const container = document.getElementById('chat-widget-container');
      if (container) {
        container.remove();
      }
      document.body.removeChild(script);
    };
  }, []);

  const handleCopy = () => {
    if (chatId) {
      const embedCode = getEmbedCode();
      navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEmbedCode = () => {
    if (!chatId) return '';
    const baseUrl = window.location.origin;
    return `<div id="chat-widget-container"></div>
<script src="${baseUrl}/api/widget/${chatId}" async></script>`;
  };

  if (!mounted) return null;

  if (showEmbedCode && chatId) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Código de Incorporação</h3>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-violet-700 bg-violet-100 hover:bg-violet-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-violet-500"
          >
            {copied ? (
              <>
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copiar
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto p-2 bg-white rounded border border-gray-200 text-xs text-gray-800 font-mono whitespace-pre-wrap">
          {getEmbedCode()}
        </pre>
        <p className="text-xs text-gray-500 mt-2">
          Cole este código no seu site para adicionar o chat widget. Certifique-se de incluir tanto a div quanto o script.
        </p>
      </div>
    );
  }

  return <div id="chat-widget-container" />;
} 