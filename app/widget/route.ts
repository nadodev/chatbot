import { NextResponse } from "next/server";

export function GET() {
  const script = `
    (function () {
      const iframe = document.createElement("iframe");
      iframe.src = "localhost:3000/chat";
      iframe.style = "position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; border: none; border-radius: 12px; z-index: 9999;";
      document.body.appendChild(iframe);
    })();
  `;
  return new NextResponse(script, {
    headers: { "Content-Type": "application/javascript" },
  });
}
