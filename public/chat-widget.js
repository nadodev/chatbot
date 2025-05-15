(function() {
  // Get or create container
  let container = document.getElementById('chat-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'chat-widget-container';
    document.body.appendChild(container);
  }

  // Read config from window.CHAT_CONFIG
  const config = window.CHAT_CONFIG || {};
  const chatId = config.id;
  const apiUrl = config.apiUrl || '/api/chat';
  
  // Default values with fallbacks
  const appearance = config.appearance || {};
  const primaryColor = appearance.primaryColor || '#6366f1';
  const userBubbleColor = appearance.userBubbleColor || primaryColor;
  const aiBubbleColor = appearance.aiBubbleColor || '#ffffff';
  const font = appearance.font || 'Inter';
  const position = appearance.position || 'bottom-right';
  const isDarkMode = appearance.darkMode === true;
  
  // Apply custom font
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  
  // Choose font based on config
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
  
  // Define colors and styles based on mode
  const colors = {
    bg: isDarkMode ? '#1f2937' : '#ffffff',
    textPrimary: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#d1d5db' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    messageBg: isDarkMode ? '#374151' : '#f9fafb',
    inputBg: isDarkMode ? '#374151' : '#ffffff',
    userBubbleBg: userBubbleColor,
    userBubbleText: getContrastColor(userBubbleColor),
    aiBubbleBg: isDarkMode ? '#4b5563' : aiBubbleColor,
    aiBubbleText: isDarkMode ? '#f9fafb' : '#1f2937',
    primaryGradient: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
    shadow: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
  };
  
  // Add base styles
  const baseStyles = document.createElement('style');
  baseStyles.innerHTML = `
    #chat-widget-container * {
      font-family: '${font}', system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px); 
      }
      to { 
        opacity: 1;
        transform: translateY(0); 
      }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .chat-bubble-animation {
      animation: slideUp 0.3s ease-out;
    }
    
    .typing-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    .typing-indicator span {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
      opacity: 0.7;
    }
    
    .typing-indicator span:nth-child(1) { animation: pulse 1s infinite 0s; }
    .typing-indicator span:nth-child(2) { animation: pulse 1s infinite 0.2s; }
    .typing-indicator span:nth-child(3) { animation: pulse 1s infinite 0.4s; }
    
    /* Style scrollbar for webkit browsers */
    .chat-messages-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-messages-container::-webkit-scrollbar-track {
      background: ${isDarkMode ? '#2d3748' : '#f3f4f6'};
      border-radius: 8px;
    }
    
    .chat-messages-container::-webkit-scrollbar-thumb {
      background: ${isDarkMode ? '#4b5563' : '#d1d5db'};
      border-radius: 8px;
    }
    
    .chat-messages-container::-webkit-scrollbar-thumb:hover {
      background: ${isDarkMode ? '#6b7280' : '#9ca3af'};
    }
    
    /* Media queries for responsiveness */
    @media (max-width: 640px) {
      .chat-widget-window {
        width: calc(100% - 32px) !important;
        right: 16px !important;
        left: 16px !important;
        bottom: 80px !important;
        height: 60vh !important;
      }
    }
  `;
  document.head.appendChild(baseStyles);

  // Create chat button with improved design
  const button = document.createElement('button');
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  `;
  button.className = 'chat-widget-button';
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${colors.primaryGradient};
    border: none;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 14px ${hexToRGBA(primaryColor, 0.4)};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 9999;
  `;
  
  // Adjust position based on config
  if (position === 'floating') {
    button.style.bottom = '50%';
    button.style.transform = 'translateY(50%)';
  } else if (position === 'popup') {
    // For popup mode, we'll create a different initial state later
    button.style.display = 'none';
  }

  // Create chat window with improved design
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chat-widget-window';
  chatWindow.style.cssText = `
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 380px;
    height: 520px;
    background: ${colors.bg};
    border-radius: 16px;
    box-shadow: 0 10px 25px ${colors.shadow}, 0 6px 12px ${hexToRGBA(colors.shadow, 0.8)};
    display: none;
    flex-direction: column;
    z-index: 9999;
    overflow: hidden;
    animation: fadeIn 0.3s ease-out;
    border: 1px solid ${hexToRGBA(colors.border, 0.5)};
    transform-origin: bottom right;
    max-width: 95vw;
  `;
  
  // Adjust window position based on config
  if (position === 'floating') {
    chatWindow.style.bottom = '50%';
    chatWindow.style.transform = 'translateY(50%)';
  } else if (position === 'popup') {
    chatWindow.style.position = 'fixed';
    chatWindow.style.top = '50%';
    chatWindow.style.left = '50%';
    chatWindow.style.transform = 'translate(-50%, -50%)';
  }

  // Add header with improved design
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px 20px;
    background: ${colors.primaryGradient};
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${hexToRGBA('#ffffff', 0.1)};
  `;
  
  // Get avatar or default emoji
  const avatarContent = config.avatar || '🤖';
  const isEmoji = /\p{Emoji}/u.test(avatarContent);
  const avatarElement = isEmoji ? 
    `<span style="font-size: 1.4rem; margin-right: 10px;">${avatarContent}</span>` : 
    `<img src="${avatarContent}" style="width: 28px; height: 28px; border-radius: 50%; margin-right: 10px; object-fit: cover;" alt="Avatar" />`;
    
  header.innerHTML = `
    <div style="display: flex; align-items: center;">
      ${avatarElement}
      <div>
        <div style="font-weight: 600; font-size: 16px;">${config.name || 'Chat de Suporte'}</div>
        <div style="font-size: 12px; opacity: 0.85;">Online</div>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      ${isDarkMode ? 
        `<button class="theme-toggle-button" aria-label="Alternar para modo claro" style="background: none; border: none; color: white; cursor: pointer; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>` 
        : 
        `<button class="theme-toggle-button" aria-label="Alternar para modo escuro" style="background: none; border: none; color: white; cursor: pointer; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>`
      }
      <button class="close-button" aria-label="Fechar chat" style="background: none; border: none; color: white; cursor: pointer; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;

  // Add chat messages container with improved design
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chat-messages-container';
  messagesContainer.style.cssText = `
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: ${colors.messageBg};
    scroll-behavior: smooth;
  `;

  // Add greeting message if available
  if (config.greeting) {
    const greetingElement = document.createElement('div');
    greetingElement.className = 'chat-bubble-animation';
    greetingElement.style.cssText = `
      padding: 12px 16px;
      background: ${colors.aiBubbleBg};
      border: 1px solid ${hexToRGBA(colors.border, 0.1)};
      border-radius: 16px 16px 16px 2px;
      max-width: 85%;
      align-self: flex-start;
      box-shadow: 0 1px 2px ${hexToRGBA(colors.shadow, 0.05)};
      color: ${colors.aiBubbleText};
      line-height: 1.5;
      font-size: 14.5px;
    `;
    greetingElement.textContent = config.greeting;
    messagesContainer.appendChild(greetingElement);
  }

  // Add input area with improved design
  const inputArea = document.createElement('div');
  inputArea.style.cssText = `
    padding: 12px 16px;
    background: ${colors.bg};
    border-top: 1px solid ${colors.border};
    display: flex;
    gap: 12px;
    align-items: center;
  `;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Digite sua mensagem...';
  input.style.cssText = `
    flex: 1;
    padding: 12px 16px;
    border: 1px solid ${colors.border};
    border-radius: 24px;
    outline: none;
    font-size: 14px;
    transition: all 0.2s;
    background-color: ${colors.inputBg};
    color: ${colors.textPrimary};
  `;
  
  // Add focus styles for input
  input.addEventListener('focus', () => {
    input.style.borderColor = primaryColor;
    input.style.boxShadow = `0 0 0 3px ${hexToRGBA(primaryColor, 0.1)}`;
  });
  
  input.addEventListener('blur', () => {
    input.style.borderColor = colors.border;
    input.style.boxShadow = 'none';
  });

  const sendButton = document.createElement('button');
  sendButton.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L3 10L10 17M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  sendButton.style.cssText = `
    width: 40px;
    height: 40px;
    background: ${colors.primaryGradient};
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  `;
  
  sendButton.addEventListener('mouseover', () => {
    sendButton.style.transform = 'scale(1.05)';
  });
  
  sendButton.addEventListener('mouseout', () => {
    sendButton.style.transform = 'scale(1)';
  });

  // Assemble the chat window
  inputArea.appendChild(input);
  inputArea.appendChild(sendButton);
  chatWindow.appendChild(header);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputArea);

  // Add to container
  container.appendChild(button);
  container.appendChild(chatWindow);

  // Show popup automatically if that position is selected
  if (position === 'popup') {
    setTimeout(() => {
      chatWindow.style.display = 'flex';
    }, 1000);
  }

  // Toggle chat window with animation
  let isOpen = position === 'popup'; // Start open if popup mode
  button.addEventListener('click', () => {
    isOpen = !isOpen;
    
    if (isOpen) {
      chatWindow.style.display = 'flex';
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
      
      // Change button icon to X when chat is open
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else {
      chatWindow.style.display = 'none';
      
      // Restore original icon
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      `;
    }
  });

  // Close chat window
  header.querySelector('.close-button').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from bubbling to the header
    isOpen = false;
    chatWindow.style.display = 'none';
    
    // Restore original icon
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    `;
  });

  // Handle theme toggle button if present
  const themeToggleButton = header.querySelector('.theme-toggle-button');
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      // We can't really toggle the theme on the fly without recreating elements
      // But we'll show a message about it
      const themeMessage = document.createElement('div');
      themeMessage.className = 'chat-bubble-animation';
      themeMessage.style.cssText = `
        padding: 12px 16px;
        background: ${colors.aiBubbleBg};
        border: 1px solid ${hexToRGBA(colors.border, 0.1)};
        border-radius: 16px 16px 16px 2px;
        max-width: 85%;
        align-self: flex-start;
        box-shadow: 0 1px 2px ${hexToRGBA(colors.shadow, 0.05)};
        color: ${colors.aiBubbleText};
        line-height: 1.5;
        font-size: 14.5px;
      `;
      themeMessage.textContent = isDarkMode 
        ? 'As preferências de tema podem ser alteradas nas configurações do chat.' 
        : 'As preferências de tema podem ser alteradas nas configurações do chat.';
      messagesContainer.appendChild(themeMessage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    
    // Hover effect for theme toggle button
    themeToggleButton.addEventListener('mouseover', () => {
      themeToggleButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    themeToggleButton.addEventListener('mouseout', () => {
      themeToggleButton.style.background = 'none';
    });
  }

  // Hover effect for close button
  const closeButton = header.querySelector('.close-button');
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
  });
  
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.background = 'none';
  });

  // Send message with improved bubble design and markdown support
  async function sendMessage() {
    const message = input.value.trim();
    if (message && chatId) {
      // Show user message with improved design
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-bubble-animation';
      messageElement.style.cssText = `
        padding: 12px 16px;
        background: ${userBubbleColor};
        color: ${colors.userBubbleText};
        border-radius: 16px 16px 2px 16px;
        max-width: 85%;
        align-self: flex-end;
        box-shadow: 0 1px 2px ${hexToRGBA(colors.shadow, 0.2)};
        line-height: 1.5;
        font-size: 14.5px;
      `;
      
      // Add timestamp
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messageElement.innerHTML = `
        <div>${escapeHtml(message)}</div>
        <div style="text-align: right; font-size: 11px; margin-top: 4px; opacity: 0.7;">${timestamp}</div>
      `;
      
      messagesContainer.appendChild(messageElement);
      input.value = '';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Show loading for assistant with improved design
      const loadingElement = document.createElement('div');
      loadingElement.className = 'chat-bubble-animation';
      loadingElement.style.cssText = `
        padding: 14px 18px;
        background: ${colors.aiBubbleBg};
        border: 1px solid ${hexToRGBA(colors.border, 0.1)};
        border-radius: 16px 16px 16px 2px;
        max-width: 85%;
        align-self: flex-start;
        box-shadow: 0 1px 2px ${hexToRGBA(colors.shadow, 0.05)};
        color: ${isDarkMode ? '#a5b4fc' : '#6366f1'};
        line-height: 1.5;
        font-size: 14.5px;
      `;
      
      // Create typing indicator with dots
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'typing-indicator';
      typingIndicator.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `;
      loadingElement.appendChild(typingIndicator);
      
      messagesContainer.appendChild(loadingElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Send to API
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, message })
        });
        const data = await res.json();
        
        // Replace loading indicator with actual response
        loadingElement.innerHTML = '';
        
        // Get response timestamp
        const responseTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format the response text - handle basic markdown
        const formattedResponse = formatResponseText(data.response || 'Erro ao responder.');
        
        loadingElement.innerHTML = `
          <div>${formattedResponse}</div>
          <div style="font-size: 11px; margin-top: 4px; opacity: 0.7;">${responseTimestamp}</div>
        `;
        loadingElement.style.color = colors.aiBubbleText;
      } catch (err) {
        loadingElement.innerHTML = '';
        loadingElement.textContent = 'Erro ao responder.';
        loadingElement.style.color = '#ef4444';
      }
    }
  }

  sendButton.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Add hover and active effects to button
  button.addEventListener('mouseover', () => {
    button.style.transform = position === 'floating' ? 'translateY(50%) scale(1.1)' : 'scale(1.1)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.transform = position === 'floating' ? 'translateY(50%)' : 'scale(1)';
  });
  
  button.addEventListener('mousedown', () => {
    button.style.transform = position === 'floating' ? 'translateY(50%) scale(0.95)' : 'scale(0.95)';
  });
  
  button.addEventListener('mouseup', () => {
    button.style.transform = position === 'floating' ? 'translateY(50%) scale(1.1)' : 'scale(1.1)';
  });
  
  // Helper function: Convert hex color to rgba
  function hexToRGBA(hex, alpha = 1) {
    let r, g, b;
    
    // Handle shorthand hex (#fff)
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } 
    // Handle full hex (#ffffff)
    else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    // Default if invalid hex
    else {
      r = 0; g = 0; b = 0;
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Helper function: Adjust color brightness
  function adjustColor(hex, percent) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  // Helper function: Get contrast color (black or white) based on background
  function getContrastColor(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Calculate luminance - https://www.w3.org/TR/WCAG20-TECHS/G17.html
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
  
  // Format text to handle basic markdown
  function formatResponseText(text) {
    if (!text) return '';
    
    // Escape HTML
    let formatted = escapeHtml(text);
    
    // Bold: **text** or __text__
    formatted = formatted.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
    
    // Italic: *text* or _text_
    formatted = formatted.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
    
    // Lists
    formatted = formatted.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    
    // Paragraphs and line breaks
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already wrapped
    if (!formatted.startsWith('<p>')) {
      formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
  }
  
  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
})();