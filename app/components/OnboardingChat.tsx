'use client';

import { useState } from 'react';

interface OnboardingChatProps {
  onComplete: (responses: Record<string, string>) => void;
}

const questions = [
  {
    id: 'name',
    question: 'What is your name?',
    type: 'text'
  },
  {
    id: 'email',
    question: 'What is your email address?',
    type: 'email'
  },
  {
    id: 'company',
    question: 'What is your company name?',
    type: 'text'
  },
  {
    id: 'needs',
    question: 'What are your main needs for the chatbot?',
    type: 'textarea'
  }
];

export default function OnboardingChat({ onComplete }: OnboardingChatProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      const newResponses = {
        ...responses,
        [currentQuestion.id]: inputValue.trim()
      };
      
      setResponses(newResponses);
      setInputValue('');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        onComplete(newResponses);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`transition-all duration-300 ${
              index === currentQuestionIndex
                ? 'opacity-100 transform translate-x-0'
                : index < currentQuestionIndex
                ? 'opacity-50 transform -translate-x-4'
                : 'opacity-0 transform translate-x-4'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 flex items-center justify-center text-white font-medium">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-900">{q.question}</p>
                {index < currentQuestionIndex && responses[q.id] && (
                  <p className="mt-2 text-gray-600">{responses[q.id]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        {currentQuestion.type === 'textarea' ? (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            rows={4}
            placeholder="Type your answer here..."
          />
        ) : (
          <input
            type={currentQuestion.type}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Type your answer here..."
          />
        )}
        <button
          type="submit"
          className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-violet-600 to-blue-500 shadow-md hover:from-violet-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Complete'}
        </button>
      </form>
    </div>
  );
} 