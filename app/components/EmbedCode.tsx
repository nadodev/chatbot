import { useState } from 'react';

interface EmbedCodeProps {
  chatId: string;
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

export default function EmbedCode({ chatId, config }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const getEmbedCode = () => {
    const code = `<script>
  window.CHAT_CONFIG = {
    id: "${chatId}",
    name: "${config.name}",
    avatar: "${config.avatar}",
    greeting: "${config.greeting}",
    appearance: {
      primaryColor: "${config.appearance.primaryColor}",
      userBubbleColor: "${config.appearance.userBubbleColor}",
      aiBubbleColor: "${config.appearance.aiBubbleColor}",
      font: "${config.appearance.font}",
      position: "${config.appearance.position}",
      animation: "${config.appearance.animation}",
      darkMode: ${config.appearance.darkMode}
    }
  };
</script>
<script src="${window.location.origin}/widget.js"></script>`;

    return code;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Embed Code</h3>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      <div className="relative">
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <code>{getEmbedCode()}</code>
        </pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>Copy the embed code above</li>
          <li>Paste it into your website's HTML, just before the closing &lt;/body&gt; tag</li>
          <li>The chat widget will appear on your website according to the selected position</li>
          <li>You can customize the appearance in the chat settings</li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Preview</h4>
        <p className="text-sm text-yellow-700">
          The chat widget will look like this on your website:
        </p>
        <div className="mt-4 h-96 relative">
          <ChatPreview config={config} />
        </div>
      </div>
    </div>
  );
} 