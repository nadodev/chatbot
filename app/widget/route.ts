import { NextResponse } from "next/server";

export function GET() {
  const script = `
    (function() {
      // Get or create container
      let container = document.getElementById('chat-widget-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'chat-widget-container';
        document.body.appendChild(container);
      }

      // Create chat button
      const button = document.createElement('button');
      button.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      \`;
      button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4f46e5; color: white; padding: 16px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10000; border: none; cursor: pointer;';
      button.id = 'chat-widget-button';
      container.appendChild(button);

      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.id = 'chat-widget-window';
      chatWindow.style.cssText = 'position: fixed; bottom: 80px; right: 20px; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); z-index: 9999; display: none; flex-direction: column; overflow: hidden;';
      container.appendChild(chatWindow);

      // Create chat header
      const header = document.createElement('div');
      header.style.cssText = 'padding: 16px; background: #4f46e5; color: white; display: flex; justify-content: space-between; align-items: center;';
      header.innerHTML = \`
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🤖</span>
          <span style="font-weight: 500;">Chat Assistant</span>
        </div>
        <button id="chat-widget-close" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      \`;
      chatWindow.appendChild(header);

      // Create chat messages container
      const messages = document.createElement('div');
      messages.id = 'chat-widget-messages';
      messages.style.cssText = 'flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;';
      chatWindow.appendChild(messages);

      // Create chat input container
      const inputContainer = document.createElement('div');
      inputContainer.style.cssText = 'padding: 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px;';
      chatWindow.appendChild(inputContainer);

      // Create chat input
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Digite sua mensagem...';
      input.style.cssText = 'flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; outline: none;';
      inputContainer.appendChild(input);

      // Create send button
      const sendButton = document.createElement('button');
      sendButton.innerHTML = \`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
        </svg>
      \`;
      sendButton.style.cssText = 'width: 36px; height: 36px; border-radius: 6px; background: #4f46e5; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;';
      inputContainer.appendChild(sendButton);

      // Add initial greeting message
      const addMessage = (content, isUser = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = \`
          display: flex;
          gap: 8px;
          align-items: flex-start;
          \${isUser ? 'flex-direction: row-reverse;' : ''}
        \`;

        const avatar = document.createElement('div');
        avatar.style.cssText = \`
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: \${isUser ? '#4f46e5' : '#f3f4f6'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        \`;
        avatar.textContent = isUser ? '👤' : '🤖';

        const bubble = document.createElement('div');
        bubble.style.cssText = \`
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 12px;
          background-color: \${isUser ? '#4f46e5' : '#f3f4f6'};
          color: \${isUser ? 'white' : '#1f2937'};
        \`;
        bubble.textContent = content;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
      };

      // Add greeting message
      addMessage('Olá! Como posso ajudar?');

      // Toggle chat window
      let isOpen = false;
      const toggleChat = () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        button.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
      };

      // Event listeners
      button.addEventListener('click', toggleChat);
      document.getElementById('chat-widget-close').addEventListener('click', toggleChat);

      // Handle send message
      const sendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, true);
        input.value = '';

        try {
          // Send message to API
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: message }],
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
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });

      console.log('Chat widget initialized successfully');
    })();
  `;

  return new NextResponse(script, {
    headers: { "Content-Type": "application/javascript" },
  });
}
