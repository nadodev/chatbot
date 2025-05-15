import { useState } from 'react';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface ChatStepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  disabled?: boolean;
}

export default function ChatStepper({ steps, currentStep, onStepChange, disabled = false }: ChatStepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.id} className="md:flex-1">
            <button
              onClick={() => !disabled && onStepChange(index)}
              disabled={disabled}
              className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                index <= currentStep
                  ? 'border-violet-600'
                  : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span
                className={`text-sm font-medium ${
                  index <= currentStep ? 'text-violet-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
              <span
                className={`text-sm ${
                  index <= currentStep ? 'text-violet-700' : 'text-gray-500'
                }`}
              >
                {step.description}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
} 