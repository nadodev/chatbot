import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;

    // Buscar configuração do chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return new NextResponse('Chat não encontrado', { status: 404 });
    }

    // Analisar aparência e comportamento das configurações JSON
    const appearance = chat.appearance ? JSON.parse(chat.appearance.toString()) : {};
    const behavior = chat.behavior ? JSON.parse(chat.behavior.toString()) : {};
    
    // Verificar se o chat está pausado
    const isPaused = chat.status === 'paused';
    const pausedMessage = behavior.offlineMessage || 'Este chat está temporariamente indisponível. Por favor, volte mais tarde.';

    // Gerar o código JS do widget com as configurações embutidas
    const widgetScript = `
(function() {
  // Get or create container
  let container = document.getElementById('chat-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'chat-widget-container';
    document.body.appendChild(container);
  }

  // Configuração específica deste chat - ID: ${chatId}
  const chatId = "${chatId}";
  const chatName = "${chat.name}";
  const avatar = "${chat.avatar}";
  const greeting = "${chat.greeting}";
  const apiUrl = "${request.nextUrl.origin}/api/chat";
  
  // Status do chat
  const isPaused = ${isPaused};
  const pausedMessage = "${pausedMessage}";
  
  // Configurações de aparência
  const primaryColor = "${appearance.primaryColor || '#6366f1'}";
  const userBubbleColor = "${appearance.userBubbleColor || '#e5e7eb'}";
  const aiBubbleColor = "${appearance.aiBubbleColor || '#f3f4f6'}";
  const font = "${appearance.font || 'Inter'}";
  const position = "${appearance.position || 'bottom-right'}";
  const darkMode = ${appearance.darkMode || false};
  const animation = "${appearance.animation || 'slide-up'}";
  
  // Configurações de comportamento
  const requestTimeout = ${behavior.requestTimeout || 15000}; // Timeout para requisições à API (15 segundos)
  
  // Carrega a fonte personalizada
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  
  // Escolhe a fonte baseada na configuração
  switch(font.toLowerCase()) {
    case 'roboto':
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
      break;
    case 'open sans':
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap';
      break;
    case 'lato':
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap';
      break;
    case 'poppins':
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
      break;
    case 'montserrat':
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap';
      break;
    default:
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  }
  document.head.appendChild(fontLink);

  // Adicionar estilos globais
  const styles = document.createElement('style');
  styles.textContent = \`
    #chat-widget-container * {
      font-family: "\${font}", system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideRight {
      from { transform: translateX(-20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes bounceIn {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
    
    .ai-message-animation {
      animation: slideRight 0.3s ease-out forwards;
    }
    
    .user-message-animation {
      animation: slideUp 0.3s ease-out forwards;
    }
    
    .dots-typing {
      display: inline-flex;
      align-items: center;
      height: 15px;
    }
    
    .dots-typing span {
      width: 6px;
      height: 6px;
      margin: 0 2px;
      background-color: currentColor;
      border-radius: 50%;
      display: inline-block;
      animation: dot-flashing 1s infinite alternate;
    }
    
    .dots-typing span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .dots-typing span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes dot-flashing {
      0% { opacity: 0.3; transform: scale(1); }
      100% { opacity: 1; transform: scale(1.3); }
    }
    
    /* Estilos para scrollbar */
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-messages::-webkit-scrollbar-track {
      background: \${darkMode ? '#111827' : '#f1f1f1'};
      border-radius: 10px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
      background: \${darkMode ? '#374151' : '#c1c1c1'};
      border-radius: 10px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: \${darkMode ? '#4b5563' : '#a1a1a1'};
    }

    /* Media queries para responsividade */
    @media screen and (max-width: 480px) {
      .chat-widget-window {
        right: 10px !important;
        left: 10px !important;
        bottom: 80px !important;
        width: auto !important;
        max-width: none !important;
      }
    }
  \`;
  document.head.appendChild(styles);

  // Helper para tons de cor
  function adjustColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = Math.min(255, Math.max(0, R + percent));
    G = Math.min(255, Math.max(0, G + percent));
    B = Math.min(255, Math.max(0, B + percent));

    const rr = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const gg = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const bb = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+rr+gg+bb;
  }

  // Helper para rgba
  function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
  }

  // Helper para determinar se uma cor é clara ou escura
  function isLightColor(color) {
    const r = parseInt(color.substring(1,3),16);
    const g = parseInt(color.substring(3,5),16);
    const b = parseInt(color.substring(5,7),16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  }

  // Determinar cor do texto com base no background
  const userTextColor = isLightColor(userBubbleColor) ? '#000000' : '#ffffff';
  const aiTextColor = isLightColor(aiBubbleColor) ? '#000000' : '#ffffff';

  // Create chat button with improved design
  const button = document.createElement('button');
  button.innerHTML = \`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  \`;
  button.className = 'chat-widget-button';
  button.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, \${primaryColor}, \${adjustColor(primaryColor, -30)});
    border: none;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px \${hexToRgba(primaryColor, 0.4)};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s, box-shadow 0.3s;
    z-index: 9999;
  \`;
  
  // Ajustar posição com base nas configurações
  if (position === 'bottom-left') {
    button.style.right = 'auto';
    button.style.left = '20px';
  } else if (position === 'floating') {
    button.style.bottom = '50%';
    button.style.transform = 'translateY(50%)';
    button.style.right = '20px';
  }

  // Create chat window with improved design
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chat-widget-window';
  
  // Escolher animação baseada na configuração
  let initialAnimation = '';
  if (animation === 'slide-up') {
    initialAnimation = 'transform: translateY(20px); opacity: 0;';
  } else if (animation === 'fade-in') {
    initialAnimation = 'opacity: 0;';
  } else if (animation === 'bounce') {
    initialAnimation = 'transform: scale(0.9); opacity: 0;';
  }
  
  chatWindow.style.cssText = \`
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 360px;
    height: 520px;
    background: \${darkMode ? '#1f2937' : 'white'};
    color: \${darkMode ? 'white' : 'black'};
    border-radius: 16px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.28);
    display: none;
    flex-direction: column;
    z-index: 9999;
    overflow: hidden;
    \${initialAnimation}
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 95vw;
    border: \${darkMode ? '1px solid #374151' : '1px solid rgba(0,0,0,0.08)'};
  \`;
  
  // Ajustar posição com base nas configurações
  if (position === 'bottom-left') {
    chatWindow.style.right = 'auto';
    chatWindow.style.left = '20px';
  } else if (position === 'floating') {
    chatWindow.style.bottom = '50%';
    chatWindow.style.transform = 'translateY(50%)';
    chatWindow.style.right = '20px';
  }

  // Add header with improved design
  const header = document.createElement('div');
  header.style.cssText = \`
    padding: 16px 20px;
    background: linear-gradient(135deg, \${primaryColor}, \${adjustColor(primaryColor, -30)});
    color: white;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid \${hexToRgba(primaryColor, 0.2)};
  \`;
  
  // Verificar se o avatar é um emoji
  const isEmoji = /\\p{Emoji}/u.test(avatar);
  const avatarDisplay = isEmoji ? avatar : '🤖';
  
  header.innerHTML = \`
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 20px; line-height: 1;">\${avatarDisplay}</span>
      <div>
        <div style="font-weight: 600;">\${chatName}</div>
        <div style="font-size: 12px; opacity: 0.8;">
          \${isPaused ? 
          '<span style="color: #ef4444;">Offline</span>' : 
          '<span style="color: #10b981;">Online</span>'}
        </div>
      </div>
    </div>
    <button class="close-button" aria-label="Fechar chat" style="background: none; border: none; color: white; cursor: pointer; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s;">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  \`;

  // Add chat messages container with improved design
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chat-messages';
  messagesContainer.style.cssText = \`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: \${darkMode ? '#111827' : '#f9fafb'};
    scroll-behavior: smooth;
  \`;

  // Add input area with improved design
  const inputArea = document.createElement('div');
  inputArea.style.cssText = \`
    padding: 16px;
    border-top: 1px solid \${darkMode ? '#374151' : '#e5e7eb'};
    display: flex;
    gap: 12px;
    background-color: \${darkMode ? '#1f2937' : 'white'};
    align-items: center;
  \`;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Digite sua mensagem...';
  input.style.cssText = \`
    flex: 1;
    padding: 12px 16px;
    border: 1px solid \${darkMode ? '#4b5563' : '#e5e7eb'};
    border-radius: 100px;
    outline: none;
    background-color: \${darkMode ? '#374151' : 'white'};
    color: \${darkMode ? 'white' : 'black'};
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  \`;
  
  // Adicionar container para sugestões
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'chat-suggestions';
  suggestionsContainer.style.cssText = \`
    position: absolute;
    bottom: 80px;
    left: 16px;
    right: 16px;
    max-height: 200px;
    background-color: \${darkMode ? '#1f2937' : 'white'};
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: hidden;
    z-index: 10;
    display: none;
    flex-direction: column;
    border: 1px solid \${darkMode ? '#374151' : '#e5e7eb'};
  \`;
  
  // Variáveis para controlar sugestões
  let typingTimer;
  const doneTypingInterval = 500;
  let activeSuggestionIndex = -1;
  let suggestions = [];
  
  // Adicionar eventos de foco no input
  input.addEventListener('focus', () => {
    input.style.borderColor = primaryColor;
    input.style.boxShadow = \`0 0 0 2px \${hexToRgba(primaryColor, 0.15)}\`;
  });
  
  input.addEventListener('blur', () => {
    input.style.borderColor = darkMode ? '#4b5563' : '#e5e7eb';
    input.style.boxShadow = 'none';
    // Esconder sugestões com pequeno delay para permitir clique
    setTimeout(() => {
      suggestionsContainer.style.display = 'none';
    }, 150);
  });
  
  // Função para buscar sugestões
  async function fetchSuggestions(query) {
    if (isPaused || !query || query.length < 2) {
      suggestionsContainer.style.display = 'none';
      return;
    }
    
    try {
      const response = await fetch(\`\${apiUrl.replace('/chat', '/suggest')}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        suggestions = data.suggestions || [];
        
        // Mostrar sugestões se houver alguma
        if (suggestions.length > 0) {
          renderSuggestions(suggestions);
          suggestionsContainer.style.display = 'flex';
        } else {
          suggestionsContainer.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  }
  
  // Função para renderizar sugestões
  function renderSuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.setAttribute('data-index', index);
      
      // Estilo baseado no tipo de sugestão
      let iconSvg = '';
      if (suggestion.type === 'message') {
        iconSvg = \`<svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L9 15L2 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>\`;
      } else if (suggestion.type === 'source') {
        iconSvg = \`<svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 1h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 1l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>\`;
      } else if (suggestion.type === 'database') {
        iconSvg = \`<svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 1C5.59 1 2 2.79 2 5s3.59 4 8 4 8-1.79 8-4-3.59-4-8-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 5v5c0 2.21 3.59 4 8 4s8-1.79 8-4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 10v5c0 2.21 3.59 4 8 4s8-1.79 8-4v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>\`;
      } else {
        iconSvg = \`<svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 17A8 8 0 109 1a8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>\`;
      }
      
      item.style.cssText = \`
        padding: 10px 16px;
        border-bottom: 1px solid \${darkMode ? '#374151' : '#f3f4f6'};
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        transition: background-color 0.15s;
        color: \${darkMode ? '#e5e7eb' : '#4b5563'};
      \`;
      
      // Conteúdo da sugestão
      item.innerHTML = \`
        <span style="color: \${primaryColor}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
          \${iconSvg}
        </span>
        <div style="display: flex; flex-direction: column; overflow: hidden;">
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: \${darkMode ? 'white' : 'black'};">
            \${suggestion.text}
          </span>
          \${suggestion.source ? \`<span style="font-size: 11px; opacity: 0.7;">\${suggestion.source}</span>\` : ''}
        </div>
      \`;
      
      // Adicionar evento de hover
      item.addEventListener('mouseover', () => {
        activeSuggestionIndex = index;
        highlightSuggestion();
      });
      
      // Adicionar evento de clique
      item.addEventListener('click', () => {
        selectSuggestion(suggestion);
      });
      
      suggestionsContainer.appendChild(item);
    });
  }
  
  // Função para destacar a sugestão ativa
  function highlightSuggestion() {
    const items = suggestionsContainer.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
      if (index === activeSuggestionIndex) {
        item.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6';
      } else {
        item.style.backgroundColor = 'transparent';
      }
    });
  }
  
  // Função para selecionar uma sugestão
  function selectSuggestion(suggestion) {
    // Se for uma sugestão de mensagem ou fonte, usamos o texto como input
    if (suggestion.type === 'message' || suggestion.type === 'source' || suggestion.type === 'database') {
      // Extract actual text without ellipses
      let text = suggestion.text.replace(/^\.\.\./, '').replace(/\.\.\.$/, '');
      input.value = text;
      input.focus();
    } 
    
    // Esconder o container de sugestões
    suggestionsContainer.style.display = 'none';
    activeSuggestionIndex = -1;
  }
  
  // Eventos para detectar quando o usuário digita
  input.addEventListener('keyup', function(e) {
    // Ignorar se for uma tecla especial de navegação
    if (suggestionsContainer.style.display === 'flex' && 
        (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Escape')) {
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSuggestionIndex = Math.max(0, activeSuggestionIndex - 1);
        highlightSuggestion();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSuggestionIndex = Math.min(suggestions.length - 1, activeSuggestionIndex + 1);
        highlightSuggestion();
      } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeSuggestionIndex]);
      } else if (e.key === 'Escape') {
        suggestionsContainer.style.display = 'none';
      }
      return;
    }
    
    // Reiniciar o timer de digitação
    clearTimeout(typingTimer);
    
    // Iniciar nova contagem se o input tiver conteúdo
    if (input.value.trim().length >= 2) {
      typingTimer = setTimeout(() => {
        fetchSuggestions(input.value.trim());
      }, doneTypingInterval);
    } else {
      suggestionsContainer.style.display = 'none';
    }
  });
  
  // Reiniciar o timer quando o usuário continua digitando
  input.addEventListener('keydown', function(e) {
    clearTimeout(typingTimer);
    
    // Evite comportamento padrão para as teclas de navegação quando as sugestões estão abertas
    if (suggestionsContainer.style.display === 'flex' && 
        (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
         (e.key === 'Enter' && activeSuggestionIndex >= 0))) {
      e.preventDefault();
    }
  });

  const sendButton = document.createElement('button');
  sendButton.innerHTML = \`
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L3 10L10 18M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  \`;
  sendButton.style.cssText = \`
    width: 42px;
    height: 42px;
    min-width: 42px;
    background: linear-gradient(135deg, \${primaryColor}, \${adjustColor(primaryColor, -30)});
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background-color 0.2s;
    box-shadow: 0 2px 8px \${hexToRgba(primaryColor, 0.3)};
  \`;

  // Assemble the chat window
  inputArea.appendChild(input);
  inputArea.appendChild(sendButton);
  chatWindow.appendChild(header);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputArea);
  chatWindow.appendChild(suggestionsContainer);

  // Add to container
  container.appendChild(button);
  container.appendChild(chatWindow);
  
  // Estado da conversa
  let isOpen = false;
  let messageCounter = 0;
  
  // Toggle chat window with animation
  button.addEventListener('click', () => {
    isOpen = !isOpen;
    
    if (isOpen) {
      chatWindow.style.display = 'flex';
      
      // Aplicar animação suave de abertura
      setTimeout(() => {
        if (animation === 'slide-up') {
          chatWindow.style.transform = 'translateY(0)';
          chatWindow.style.opacity = '1';
        } else if (animation === 'fade-in') {
          chatWindow.style.opacity = '1';
        } else if (animation === 'bounce') {
          chatWindow.style.transform = 'scale(1)';
          chatWindow.style.opacity = '1';
        }
      }, 10);
      
      // Mostrar mensagem de boas-vindas se for a primeira abertura
      if (messagesContainer.children.length === 0) {
        setTimeout(() => {
          // Se o chat estiver pausado, mostrar mensagem de indisponibilidade
          if (isPaused) {
            showAssistantMessage(pausedMessage);
          } else {
            showAssistantMessage(greeting);
          }
        }, 300);
      }
      
      // Modificar o ícone do botão quando aberto
      button.innerHTML = \`
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      \`;
      
      // Focar no input
      input.focus();
    } else {
      // Aplicar animação suave de fechamento
      if (animation === 'slide-up') {
        chatWindow.style.transform = 'translateY(20px)';
        chatWindow.style.opacity = '0';
      } else if (animation === 'fade-in') {
        chatWindow.style.opacity = '0';
      } else if (animation === 'bounce') {
        chatWindow.style.transform = 'scale(0.9)';
        chatWindow.style.opacity = '0';
      }
      
      // Esconder o chat após a animação
      setTimeout(() => {
        chatWindow.style.display = 'none';
      }, 300);
      
      // Restaurar o ícone original
      button.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      \`;
    }
  });

  // Close chat window
  header.querySelector('.close-button').addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = false;
    
    // Aplicar animação suave de fechamento
    if (animation === 'slide-up') {
      chatWindow.style.transform = 'translateY(20px)';
      chatWindow.style.opacity = '0';
    } else if (animation === 'fade-in') {
      chatWindow.style.opacity = '0';
    } else if (animation === 'bounce') {
      chatWindow.style.transform = 'scale(0.9)';
      chatWindow.style.opacity = '0';
    }
    
    // Esconder o chat após a animação
    setTimeout(() => {
      chatWindow.style.display = 'none';
    }, 300);
    
    // Restaurar o ícone original
    button.innerHTML = \`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    \`;
  });
  
  // Hover effects para botões
  header.querySelector('.close-button').addEventListener('mouseover', function() {
    this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  });
  
  header.querySelector('.close-button').addEventListener('mouseout', function() {
    this.style.backgroundColor = 'transparent';
  });
  
  button.addEventListener('mouseover', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = \`0 6px 16px \${hexToRgba(primaryColor, 0.5)}\`;
  });
  
  button.addEventListener('mouseout', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = \`0 4px 12px \${hexToRgba(primaryColor, 0.4)}\`;
  });
  
  sendButton.addEventListener('mouseover', () => {
    sendButton.style.transform = 'scale(1.05)';
    sendButton.style.background = \`linear-gradient(135deg, \${adjustColor(primaryColor, 15)}, \${adjustColor(primaryColor, -15)})\`;
  });
  
  sendButton.addEventListener('mouseout', () => {
    sendButton.style.transform = 'scale(1)';
    sendButton.style.background = \`linear-gradient(135deg, \${primaryColor}, \${adjustColor(primaryColor, -30)})\`;
  });

  // Helper function to mostrar mensagem do assistente
  function showAssistantMessage(text, isLoading = false) {
    const messageId = 'msg-' + messageCounter++;
    
    // Container da mensagem
    const messageWrapper = document.createElement('div');
    messageWrapper.id = messageId;
    messageWrapper.className = 'ai-message-animation';
    messageWrapper.style.cssText = \`
      display: flex;
      gap: 10px;
      align-items: flex-start;
      max-width: 100%;
      opacity: 0;
    \`;
    
    // Avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.style.cssText = \`
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      line-height: 1;
      border-radius: 50%;
      background: linear-gradient(135deg, \${primaryColor}, \${adjustColor(primaryColor, -30)});
      color: white;
      margin-top: 2px;
    \`;
    avatarContainer.textContent = avatar;
    
    // Message bubble
    const messageElement = document.createElement('div');
    messageElement.style.cssText = \`
      flex: 1;
      padding: 12px 16px;
      border-radius: 16px 16px 16px 4px;
      background-color: \${darkMode ? '#374151' : aiBubbleColor};
      color: \${aiTextColor};
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    \`;
    
    if (isLoading) {
      // Mostrar indicador de digitação
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'dots-typing';
      typingIndicator.innerHTML = '<span></span><span></span><span></span>';
      messageElement.appendChild(typingIndicator);
    } else {
      // Mostrar o texto da mensagem
      messageElement.textContent = text;
    }
    
    // Adicionar avatar e conteúdo na mensagem
    messageWrapper.appendChild(avatarContainer);
    messageWrapper.appendChild(messageElement);
    messagesContainer.appendChild(messageWrapper);
    
    // Animação para aparecer
    setTimeout(() => {
      messageWrapper.style.opacity = '1';
    }, 10);
    
    // Scroll para a mensagem mais recente
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageId;
  }
  
  // Helper function to mostrar mensagem do usuário
  function showUserMessage(text) {
    const messageId = 'msg-' + messageCounter++;
    
    // Timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Container da mensagem
    const messageWrapper = document.createElement('div');
    messageWrapper.id = messageId;
    messageWrapper.className = 'user-message-animation';
    messageWrapper.style.cssText = \`
      display: flex;
      flex-direction: row-reverse;
      gap: 10px;
      align-items: flex-start;
      max-width: 100%;
      opacity: 0;
    \`;
    
    // Message bubble
    const messageElement = document.createElement('div');
    messageElement.style.cssText = \`
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px 16px 4px 16px;
      background: linear-gradient(135deg, \${userBubbleColor}, \${adjustColor(userBubbleColor, -10)});
      color: \${userTextColor};
      font-size: 14px;
      line-height: 1.5;
      text-align: right;
      white-space: pre-wrap;
      word-break: break-word;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    \`;
    
    messageElement.textContent = text;
    
    // Adicionar conteúdo na mensagem
    messageWrapper.appendChild(messageElement);
    messagesContainer.appendChild(messageWrapper);
    
    // Animação para aparecer
    setTimeout(() => {
      messageWrapper.style.opacity = '1';
    }, 10);
    
    // Scroll para a mensagem mais recente
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageId;
  }

  // Send message action
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isPaused) return; // Não envia mensagem se o texto estiver vazio ou o chat pausado
    
    // Limpa o input e mostra a mensagem do usuário
    input.value = '';
    input.focus();
    showUserMessage(text);
    
    // Mostra o indicador de "digitando..." do assistente
    const loadingId = showAssistantMessage('', true);
    
    try {
      // Enviar a mensagem para a API com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: text }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Substitui o indicador de digitação pela resposta
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) messagesContainer.removeChild(loadingMsg);
        
        showAssistantMessage(data.response || 'Ocorreu um erro na comunicação.');
      } else if (response.status === 403) {
        // Chat pausado
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) messagesContainer.removeChild(loadingMsg);
        
        showAssistantMessage(pausedMessage);
      } else {
        throw new Error('Falha na requisição');
      }
    } catch (error) {
      // Remover indicador de digitação e mostrar erro
      const loadingMsg = document.getElementById(loadingId);
      if (loadingMsg) messagesContainer.removeChild(loadingMsg);
      
      if (error.name === 'AbortError') {
        showAssistantMessage('A resposta demorou muito tempo. Por favor, tente novamente.');
      } else {
        showAssistantMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
      }
    }
  }
  
  // Adicionar eventos para envio de mensagem
  sendButton.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Desabilitar input e botão se o chat estiver pausado
  if (isPaused) {
    input.disabled = true;
    input.placeholder = 'Chat temporariamente indisponível...';
    input.style.opacity = '0.7';
    input.style.cursor = 'not-allowed';
    
    sendButton.disabled = true;
    sendButton.style.opacity = '0.5';
    sendButton.style.cursor = 'not-allowed';
    
    // Modificar o botão flutuante para indicar status pausado
    button.style.background = '#9ca3af';
  }
})();
`;

    // Return the widget script
    return new NextResponse(widgetScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating widget:', error);
    return new NextResponse('Error generating widget', { status: 500 });
  }
}