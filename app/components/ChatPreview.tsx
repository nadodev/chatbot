"use client";

import Image from 'next/image';

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
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ backgroundColor: config.appearance.primaryColor }}>
        <div className="flex items-center space-x-3">
          <Image
            src={config.avatar}
            alt={config.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <div className="text-white font-medium">{config.name}</div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div
          className="p-3 rounded-lg max-w-[80%]"
          style={{ backgroundColor: config.appearance.aiBubbleColor }}
        >
          <p className="text-sm">{config.greeting}</p>
        </div>
        <div
          className="p-3 rounded-lg max-w-[80%] ml-auto"
          style={{ backgroundColor: config.appearance.userBubbleColor }}
        >
          <p className="text-sm">Hello! How can I help you today?</p>
        </div>
      </div>
    </div>
  );
}
