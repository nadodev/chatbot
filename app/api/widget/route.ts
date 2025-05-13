import { NextResponse } from "next/server";

export async function GET() {
  const widgetScript = `
    (function() {
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'chat-widget-container';
      document.body.appendChild(widgetContainer);

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = '${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/chat';
      iframe.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 380px; height: 450px; border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); z-index: 9999; display: none;';
      iframe.id = 'chat-widget-iframe';
      widgetContainer.appendChild(iframe);

      // Create toggle button
      const button = document.createElement('button');
      button.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      \`;
      button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4f46e5; color: white; padding: 16px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10000; border: none; cursor: pointer;';
      button.id = 'chat-widget-button';
      widgetContainer.appendChild(button);

      // Toggle widget visibility
      let isOpen = false;
      button.addEventListener('click', () => {
        isOpen = !isOpen;
        iframe.style.display = isOpen ? 'block' : 'none';
        button.innerHTML = isOpen ? \`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        \` : \`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        \`;
      });
    })();
  `;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
} 