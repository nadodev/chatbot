'use client';

import { useState } from 'react';

export default function TestChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Test Button
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-red-500 text-white">
            <h3 className="text-lg font-semibold">Test Chat</h3>
          </div>
          <div className="p-4">
            <p>Test content</p>
          </div>
        </div>
      )}
    </div>
  );
} 