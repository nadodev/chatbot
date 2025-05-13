import { useState } from 'react';

interface ChatPreviewProps {
  config: {
    name: string;
    avatar: string;
    greeting: string;
    appearance: {
      primaryColor: string;
      userBubbleColor: string;
      aiBubbleColor: string;
      font: string;
      position: string;
      animation: string;
      darkMode: boolean;
    };
  };
}

export default function ChatPreview({ config }: ChatPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  }>>([
    {
      id: '1',
      content: config.greeting,
      role: 'assistant',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content,
      role: 'user' as const,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();

      // Add AI response
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const getPositionStyles = () => {
    switch (config.appearance.position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getAnimationClass = () => {
    switch (config.appearance.animation) {
      case 'slide-up':
        return 'animate-slide-up';
      case 'fade-in':
        return 'animate-fade-in';
      case 'bounce':
        return 'animate-bounce';
      default:
        return 'animate-slide-up';
    }
  };

  return (
    <div className={`fixed ${getPositionStyles()} z-50`}>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ backgroundColor: config.appearance.primaryColor }}
      >
        <span className="text-2xl">{config.avatar}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col ${getAnimationClass()}`}
          style={{
            fontFamily: config.appearance.font,
            backgroundColor: config.appearance.darkMode ? '#1a1a1a' : '#ffffff',
            color: config.appearance.darkMode ? '#ffffff' : '#000000',
          }}
        >
          {/* Header */}
          <div
            className="p-4 border-b flex items-center justify-between"
            style={{
              borderColor: config.appearance.darkMode ? '#333333' : '#e5e7eb',
            }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">{config.avatar}</span>
              <span className="font-medium">{config.name}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'rounded-br-none'
                      : 'rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor:
                      message.role === 'user'
                        ? config.appearance.userBubbleColor
                        : config.appearance.aiBubbleColor,
                    color:
                      message.role === 'user'
                        ? '#ffffff'
                        : config.appearance.darkMode
                        ? '#ffffff'
                        : '#000000',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            className="p-4 border-t"
            style={{
              borderColor: config.appearance.darkMode ? '#333333' : '#e5e7eb',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input');
                if (input) {
                  handleSendMessage(input.value);
                  input.value = '';
                }
              }}
              className="flex space-x-2"
            >
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: config.appearance.darkMode ? '#333333' : '#ffffff',
                  borderColor: config.appearance.darkMode ? '#444444' : '#e5e7eb',
                  color: config.appearance.darkMode ? '#ffffff' : '#000000',
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: config.appearance.primaryColor }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 