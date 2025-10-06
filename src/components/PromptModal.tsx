import { X, Copy, Check } from 'lucide-react';
import { Prompt } from '../lib/supabase';
import { useState } from 'react';

interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptModal({ prompt, isOpen, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !prompt) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-700 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <img
              src={prompt.image_url}
              alt={prompt.title}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-900 text-blue-200 text-xs font-semibold rounded-full mb-3">
                {prompt.category}
              </span>
              <h2 className="text-3xl font-bold text-white mb-2">
                {prompt.title}
              </h2>
              {prompt.description && (
                <p className="text-slate-400">
                  {prompt.description}
                </p>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  AI Prompt
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {prompt.prompt_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
