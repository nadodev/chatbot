import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CodeModal({ isOpen, onClose }: CodeModalProps) {
  const [copied, setCopied] = useState(false);

  const code = `<script>
  window.chatConfig = {
    apiKey: 'seu-api-key',
    theme: 'light'
  };
</script>
<script src="chat-widget.js"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-gray-800 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white mb-4">
                      Código de Integração
                    </Dialog.Title>
                    <div className="mt-4">
                      <div className="relative">
                        <div className="absolute right-4 top-4">
                          <button
                            onClick={copyToClipboard}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-900 transition-colors"
                          >
                            {copied ? (
                              <>
                                <CheckIcon className="h-4 w-4 mr-1.5" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <ClipboardIcon className="h-4 w-4 mr-1.5" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 rounded-lg bg-gray-800 text-gray-100 overflow-x-auto">
                          <code className="text-sm font-mono">
                            {code}
                          </code>
                        </pre>
                      </div>
                      <div className="mt-4 text-sm text-gray-400">
                        <p>Cole este código no final do seu arquivo HTML, antes do fechamento da tag &lt;/body&gt;.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 