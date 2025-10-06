import { useState } from 'react';
import { CreditCard, X, Check } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Choose Your Plan
          </h2>

          <p className="text-slate-300 mb-8 leading-relaxed">
            Get unlimited access to our entire library of professional AI photoshoot prompts.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Monthly</h3>
                  <p className="text-slate-400 text-sm">Flexible billing</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-600'
                }`}>
                  {selectedPlan === 'monthly' && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-white">$1</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
              <p className="text-slate-500 text-sm">Billed monthly</p>
            </button>

            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-6 rounded-xl border-2 transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <div className="absolute top-3 right-3">
                <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                  SAVE 58%
                </span>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Yearly</h3>
                  <p className="text-slate-400 text-sm">Best value</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'yearly'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-600'
                }`}>
                  {selectedPlan === 'yearly' && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-white">$5</span>
                <span className="text-slate-400 ml-2">/year</span>
              </div>
              <p className="text-slate-500 text-sm">
                <span className="line-through">$12</span> Billed annually
              </p>
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">What's Included:</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-slate-300">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Access to entire prompt library</span>
              </li>
              <li className="flex items-start text-slate-300">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>New prompts added regularly</span>
              </li>
              <li className="flex items-start text-slate-300">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>High-quality professional prompts</span>
              </li>
              <li className="flex items-start text-slate-300">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Copy prompts with one click</span>
              </li>
            </ul>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
            Subscribe Now - ${selectedPlan === 'monthly' ? '1/month' : '5/year'}
          </button>

          <p className="text-slate-500 text-xs text-center mt-4">
            Secure payment processing
          </p>
        </div>
      </div>
    </div>
  );
}
