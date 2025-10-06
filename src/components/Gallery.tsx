import { useState, useEffect } from 'react';
import { supabase, Prompt } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PaywallModal } from './PaywallModal';
import { PromptModal } from './PromptModal';
import { LogOut, Camera } from 'lucide-react';

export function Gallery() {
  const { profile, signOut } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPrompts(data);
    }
    setLoading(false);
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    if (profile?.has_paid) {
      setShowPromptModal(true);
    } else {
      setShowPaywall(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Prompt Studio</h1>
                {profile?.has_paid && (
                  <span className="text-xs text-green-400">Premium Member</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm hidden sm:block">
                {profile?.email}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Professional Photoshoot Prompts
          </h2>
          <p className="text-slate-400">
            Browse our collection of high-quality AI prompts for stunning photoshoots
          </p>
        </div>

        {!profile?.has_paid && (
          <div className="mb-8 bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-700 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Unlock Full Access
                </h3>
                <p className="text-blue-100 mb-4">
                  Get unlimited access to all prompts for just $5/year
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => handlePromptClick(prompt)}
              className="group cursor-pointer bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={prompt.image_url}
                  alt={prompt.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-2">
                    {prompt.category}
                  </span>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {prompt.title}
                  </h3>
                  {prompt.description && (
                    <p className="text-slate-300 text-sm line-clamp-2">
                      {prompt.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {prompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No prompts available yet.</p>
          </div>
        )}
      </main>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      <PromptModal
        prompt={selectedPrompt}
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
      />
    </div>
  );
}
