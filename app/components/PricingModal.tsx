'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingChat from './OnboardingChat';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
    features: string[];
  };
}

export default function PricingModal({ isOpen, onClose, plan }: PricingModalProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatResponses, setChatResponses] = useState<Record<string, string>>({});
  const router = useRouter();

  if (!isOpen) return null;

  const handleContinue = () => {
    setShowChat(true);
  };

  const handleChatComplete = (responses: Record<string, string>) => {
    setChatResponses(responses);
  };

  const handleCreateAccount = async () => {
    // Here you would typically send the data to your backend
    const data = {
      plan,
      chatResponses,
      email: chatResponses.email || '',
    };

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/send-sales-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!showChat ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              You selected the {plan.name} Plan
            </h2>
            <div className="mb-8">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                ${plan.price}<span className="text-lg text-gray-600">/month</span>
              </p>
              <ul className="space-y-4 mt-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleContinue}
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-md hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <OnboardingChat onComplete={handleChatComplete} />
            {Object.keys(chatResponses).length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleCreateAccount}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-md hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 