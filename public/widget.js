(function() {
  // Default configuration
  const defaultConfig = {
    id: '',
    name: 'Chat Assistant',
    avatar: '🤖',
    greeting: 'Olá! Como posso ajudar?',
    appearance: {
      primaryColor: '#6366f1',
      userBubbleColor: '#e5e7eb',
      aiBubbleColor: '#f3f4f6',
      font: 'Inter',
      position: 'bottom-right',
      animation: 'slide-up',
      darkMode: false
    }
  };

  // Merge default config with user config
  const config = { ...defaultConfig, ...window.CHAT_CONFIG };

  // Create widget container
  const container = document.createElement('div');
  container.id = 'chat-widget-container';
  container.style.cssText = `
    position: fixed;
    z-index: 9999;
    font-family: ${config.appearance.font}, system-ui, -apple-system, sans-serif;
    ${config.appearance.darkMode ? 'color-scheme: dark;' : ''}
  `;

  // Set position
  switch (config.appearance.position) {
    case 'bottom-right':
      container.style.bottom = '20px';
      container.style.right = '20px';
      break;
    case 'floating':
      container.style.bottom = '50%';
      container.style.right = '50%';
      container.style.transform = 'translate(50%, 50%)';
      break;
    case 'popup':
      container.style.top = '50%';
      container.style.left = '50%';
      container.style.transform = 'translate(-50%, -50%)';
      break;
  }

  // Create chat button
  const chatButton = document.createElement('button');
  chatButton.id = 'chat-widget-button';
  chatButton.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: ${config.appearance.primaryColor};
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  `;
  chatButton.innerHTML = `<span style="font-size: 24px;">${config.avatar}</span>`;

  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.id = 'chat-widget-window';
  chatWindow.style.cssText = `
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 350px;
    height: 500px;
    background-color: ${config.appearance.darkMode ? '#1f2937' : '#ffffff'};
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: none;
    flex-direction: column;
    overflow: hidden;
  `;

  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.style.cssText = `
    padding: 16px;
    background-color: ${config.appearance.primaryColor};
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  chatHeader.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 20px;">${config.avatar}</span>
      <span style="font-weight: 500;">${config.name}</span>
    </div>
    <button id="chat-widget-close" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  `;

  // Create chat messages container
  const chatMessages = document.createElement('div');
  chatMessages.id = 'chat-widget-messages';
  chatMessages.style.cssText = `
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  // Create chat input container
  const chatInputContainer = document.createElement('div');
  chatInputContainer.style.cssText = `
    padding: 16px;
    border-top: 1px solid ${config.appearance.darkMode ? '#374151' : '#e5e7eb'};
    display: flex;
    gap: 8px;
  `;

  // Create chat input
  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Digite sua mensagem...';
  chatInput.style.cssText = `
    flex: 1;
    padding: 8px 12px;
    border: 1px solid ${config.appearance.darkMode ? '#374151' : '#e5e7eb'};
    border-radius: 6px;
    background-color: ${config.appearance.darkMode ? '#374151' : '#ffffff'};
    color: ${config.appearance.darkMode ? '#ffffff' : '#1f2937'};
    outline: none;
  `;

  // Create send button
  const sendButton = document.createElement('button');
  sendButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
    </svg>
  `;
  sendButton.style.cssText = `
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background-color: ${config.appearance.primaryColor};
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Add elements to DOM
  chatInputContainer.appendChild(chatInput);
  chatInputContainer.appendChild(sendButton);
  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(chatMessages);
  chatWindow.appendChild(chatInputContainer);
  container.appendChild(chatButton);
  container.appendChild(chatWindow);
  document.body.appendChild(container);

  // Add initial greeting message
  const addMessage = (content, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: flex-start;
      ${isUser ? 'flex-direction: row-reverse;' : ''}
    `;

    const avatar = document.createElement('div');
    avatar.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: ${isUser ? config.appearance.primaryColor : config.appearance.aiBubbleColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    `;
    avatar.textContent = isUser ? '👤' : config.avatar;

    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      background-color: ${isUser ? config.appearance.primaryColor : config.appearance.aiBubbleColor};
      color: ${isUser ? 'white' : config.appearance.darkMode ? '#ffffff' : '#1f2937'};
    `;
    bubble.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // Add greeting message
  addMessage(config.greeting);

  // Toggle chat window
  let isOpen = false;
  const toggleChat = () => {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    chatButton.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
  };

  // Event listeners
  chatButton.addEventListener('click', toggleChat);
  document.getElementById('chat-widget-close').addEventListener('click', toggleChat);

  // Handle send message
  const sendMessage = async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    chatInput.value = '';

    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          chatId: config.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      addMessage(data.content);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Desculpe, ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
    }
  };

  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Add animation
  const addAnimation = () => {
    switch (config.appearance.animation) {
      case 'slide-up':
        container.style.animation = 'slideUp 0.3s ease-out';
        break;
      case 'fade-in':
        container.style.animation = 'fadeIn 0.3s ease-out';
        break;
      case 'bounce':
        container.style.animation = 'bounce 0.5s ease-out';
        break;
    }
  };

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes bounce {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Initialize animation
  addAnimation();
})(); 