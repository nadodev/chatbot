import React from "react";
import { createRoot } from "react-dom/client";
import ChatPage from "../chat/page";

interface ChatConfig {
  id: string;
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
}

declare global {
  interface Window {
    CHAT_CONFIG: ChatConfig;
  }
}

function render(container: HTMLElement) {
  const root = createRoot(container);
  root.render(<ChatPage />);
}

(window as any).ChatPage = { render };
