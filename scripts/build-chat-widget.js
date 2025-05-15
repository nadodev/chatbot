const fs = require('fs');
const path = require('path');

// Recebe argumentos: node scripts/build-chat-widget.js <chatId> <config_json>
const [,, chatId, configJson] = process.argv;

if (!chatId || !configJson) {
  console.error('Uso: node scripts/build-chat-widget.js <chatId> <config_json>');
  process.exit(1);
}

let config;
try {
  config = JSON.parse(configJson);
} catch (e) {
  console.error('Configuração inválida (JSON):', e);
  process.exit(1);
}

function escapeTemplate(str) {
  return str.replace(/`/g, '\`').replace(/\$/g, '\$');
}

const chatWidgetContent = `;(function() {
  var config = ${JSON.stringify(config)};

  // Get or create container
  var container = document.getElementById('chat-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'chat-widget-container';
    document.body.appendChild(container);
  }

  // Create chat button
  var button = document.createElement('button');
  button.innerHTML = '<span style="font-size:20px;">' + (config.avatar || '🤖') + '</span>';
  button.className = 'chat-widget-button';
  button.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'right: 20px',
    'width: 50px',
    'height: 50px',
    'border-radius: 50%','background: linear-gradient(135deg, ' + (config.appearance.primaryColor || '#7c3aed') + ', #3b82f6)',
    'border: none',
    'color: white',
    'cursor: pointer',
    'box-shadow: 0 2px 10px rgba(0,0,0,0.1)',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'transition: transform 0.2s',
    'z-index: 9999'
  ].join(';');

  // Create chat window
  var chatWindow = document.createElement('div');
  chatWindow.className = 'chat-widget-window';
  chatWindow.style.cssText = [
    'position: fixed',
    'bottom: 80px',
    'right: 20px',
    'width: 350px',
    'height: 500px',
    'background: white',
    'border-radius: 12px',
    'box-shadow: 0 5px 20px rgba(0,0,0,0.15)',
    'display: none',
    'flex-direction: column',
    'z-index: 9999',
    'overflow: hidden',
    'font-family: ' + (config.appearance.font || 'Inter') + ', sans-serif'
  ].join(';');

  // Add header
  var header = document.createElement('div');
  header.style.cssText = [
    'padding: 15px',
    'background: linear-gradient(135deg, ' + (config.appearance.primaryColor || '#7c3aed') + ', #3b82f6)',
    'color: white',
    'font-weight: bold',
    'display: flex',
    'justify-content: space-between',
    'align-items: center'
  ].join(';');
  header.innerHTML = '<span>' + (config.avatar || '🤖') + ' ' + (config.name || 'Chat de Suporte') + '</span>' +
    '<button class="close-button" style="background: none; border: none; color: white; cursor: pointer;">' +
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg></button>';

  // Add chat messages container
  var messagesContainer = document.createElement('div');
  messagesContainer.style.cssText = [
    'flex: 1',
    'padding: 15px',
    'overflow-y: auto',
    'display: flex',
    'flex-direction: column',
    'gap: 10px'
  ].join(';');

  // Add input area
  var inputArea = document.createElement('div');
  inputArea.style.cssText = [
    'padding: 15px',
    'border-top: 1px solid #e5e7eb',
    'display: flex',
    'gap: 10px'
  ].join(';');

  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Digite sua mensagem...';
  input.style.cssText = [
    'flex: 1',
    'padding: 10px',
    'border: 1px solid #e5e7eb',
    'border-radius: 6px',
    'outline: none'
  ].join(';');

  var sendButton = document.createElement('button');
  sendButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M3.33334 10H16.6667M16.6667 10L10 3.33334M16.6667 10L10 16.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';
  sendButton.style.cssText = [
    'padding: 10px',
    'background: linear-gradient(135deg, ' + (config.appearance.primaryColor || '#7c3aed') + ', #3b82f6)',
    'border: none',
    'border-radius: 6px',
    'color: white',
    'cursor: pointer',
    'display: flex',
    'align-items: center',
    'justify-content: center'
  ].join(';');

  // Assemble the chat window
  inputArea.appendChild(input);
  inputArea.appendChild(sendButton);
  chatWindow.appendChild(header);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputArea);

  // Add to container
  container.appendChild(button);
  container.appendChild(chatWindow);

  // Toggle chat window
  button.addEventListener('click', function() {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
  });

  // Close chat window
  header.querySelector('.close-button').addEventListener('click', function() {
    chatWindow.style.display = 'none';
  });

  // Send message
  function sendMessage() {
    var message = input.value.trim();
    if (message) {
      var messageElement = document.createElement('div');
      messageElement.style.cssText = [
        'padding: 10px 15px',
        'background: ' + (config.appearance.userBubbleColor || '#e5e7eb'),
        'border-radius: 12px',
        'max-width: 80%',
        'align-self: flex-end'
      ].join(';');
      messageElement.textContent = message;
      messagesContainer.appendChild(messageElement);
      input.value = '';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  sendButton.addEventListener('click', sendMessage);
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Add hover effect to button
  button.addEventListener('mouseover', function() {
    button.style.transform = 'scale(1.1)';
  });
  button.addEventListener('mouseout', function() {
    button.style.transform = 'scale(1)';
  });

  // Mensagem de saudação
  var greeting = document.createElement('div');
  greeting.style.cssText = [
    'padding: 10px 15px',
    'background: ' + (config.appearance.aiBubbleColor || '#f3f4f6'),
    'border-radius: 12px',
    'max-width: 80%',
    'align-self: flex-start',
    'margin-bottom: 8px'
  ].join(';');
  greeting.textContent = config.greeting || 'Olá! Como posso ajudar?';
  messagesContainer.appendChild(greeting);

})();
`;

// Ensure the public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the chat widget file
const fileName = `chat-widget-${chatId}.js`;
fs.writeFileSync(path.join(publicDir, fileName), chatWidgetContent);

console.log(`Chat widget file generated successfully: public/${fileName}`); 