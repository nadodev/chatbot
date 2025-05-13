import React from "react";
import { createRoot } from "react-dom/client";
import ChatPage from "../chat/page";

function render(container: HTMLElement) {
  const root = createRoot(container);
  root.render(<ChatPage />);
}

(window as any).ChatPage = { render };
