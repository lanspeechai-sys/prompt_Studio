import { useState, useEffect } from 'react';
import { supabase, Prompt, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PaywallModal } from './PaywallModal';
import { PromptModal } from './PromptModal';
import { Camera, Search, Filter } from 'lucide-react';

export function HomePage() {
  const { profile } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const isSubscriptionActive = () => {
    if (!profile?.subscription_expires_at) return false;
    return new Date(profile.subscription_expires_at) > new Date();
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPrompts();
  }, [selectedCategory, searchQuery, prompts]);

  const loadData = async () => {
    const [promptsRes, categoriesRes] = await Promise.all([
      supabase.from('prompts').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (promptsRes.data) setPrompts(promptsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const filterPrompts = () => {
    let filtered = [...prompts];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPrompts(filtered);
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    if (profile?.has_paid && isSubscriptionActive()) {
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
      <div className="bg-gradient-to-b from-slate-800 to-transparent border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Prompt Studio
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover professional AI prompts for stunning photoshoots. Browse our curated collection organized by category.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(!profile?.has_paid || !isSubscriptionActive()) && (
          <div className="mb-8 bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-700 rounded-xl p-6">
            <div className="flex items-start justify-between flex-col md:flex-row gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Unlock Full Access
                </h3>
                <p className="text-blue-100 mb-2">
                  Choose your plan and get unlimited access to all prompts
                </p>
                <div className="flex gap-4 text-sm text-blue-200">
                  <span>$1 per month</span>
                  <span>•</span>
                  <span>$5 per year (Save 58%)</span>
                </div>
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="bg-white text-blue-900 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                View Plans
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-slate-400">
            Showing {filteredPrompts.length} of {prompts.length} prompts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
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

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No prompts found matching your criteria.</p>
          </div>
        )}
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      <PromptModal
        prompt={selectedPrompt}
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
      />
    </div>
  );
}
