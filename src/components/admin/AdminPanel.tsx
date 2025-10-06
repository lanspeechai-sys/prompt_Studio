import { useState, useEffect } from 'react';
import { supabase, Prompt, Category, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, Plus, CreditCard as Edit, Trash2, Users, FolderOpen, Image as ImageIcon } from 'lucide-react';

type TabType = 'prompts' | 'categories' | 'users';

export function AdminPanel() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [promptForm, setPromptForm] = useState({
    title: '',
    description: '',
    prompt_text: '',
    image_url: '',
    category_id: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'prompts') {
      await loadPrompts();
    } else if (activeTab === 'categories') {
      await loadCategories();
    } else if (activeTab === 'users') {
      await loadUsers();
    }
    if (activeTab !== 'categories') {
      await loadCategories();
    }
    setLoading(false);
  };

  const loadPrompts = async () => {
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPrompts(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const handleSavePrompt = async () => {
    if (editingPrompt) {
      await supabase
        .from('prompts')
        .update(promptForm)
        .eq('id', editingPrompt.id);
    } else {
      await supabase.from('prompts').insert([promptForm]);
    }
    setShowPromptModal(false);
    setEditingPrompt(null);
    resetPromptForm();
    loadPrompts();
  };

  const handleDeletePrompt = async (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      await supabase.from('prompts').delete().eq('id', id);
      loadPrompts();
    }
  };

  const handleSaveCategory = async () => {
    if (editingCategory) {
      await supabase
        .from('categories')
        .update(categoryForm)
        .eq('id', editingCategory.id);
    } else {
      await supabase.from('categories').insert([categoryForm]);
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
    resetCategoryForm();
    loadCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await supabase.from('categories').delete().eq('id', id);
      loadCategories();
    }
  };

  const handleToggleUserAdmin = async (userId: string, isAdmin: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_admin: !isAdmin })
      .eq('id', userId);
    loadUsers();
  };

  const handleToggleUserSubscription = async (userId: string, hasPaid: boolean) => {
    const newExpiresAt = !hasPaid
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    await supabase
      .from('profiles')
      .update({
        has_paid: !hasPaid,
        subscription_expires_at: newExpiresAt,
        subscription_plan: !hasPaid ? 'yearly' : null,
        subscription_started_at: !hasPaid ? new Date().toISOString() : null,
      })
      .eq('id', userId);
    loadUsers();
  };

  const openEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setPromptForm({
      title: prompt.title,
      description: prompt.description || '',
      prompt_text: prompt.prompt_text,
      image_url: prompt.image_url,
      category_id: prompt.category_id || '',
    });
    setShowPromptModal(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setShowCategoryModal(true);
  };

  const resetPromptForm = () => {
    setPromptForm({
      title: '',
      description: '',
      prompt_text: '',
      image_url: '',
      category_id: '',
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
    });
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400">Manage your platform</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'prompts'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Prompts
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
        </div>

        {activeTab === 'prompts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Manage Prompts</h2>
              <button
                onClick={() => {
                  resetPromptForm();
                  setEditingPrompt(null);
                  setShowPromptModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Prompt
              </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {prompts.map((prompt) => (
                      <tr key={prompt.id} className="hover:bg-slate-750">
                        <td className="px-4 py-3">
                          <img src={prompt.image_url} alt={prompt.title} className="w-16 h-16 object-cover rounded" />
                        </td>
                        <td className="px-4 py-3 text-white">{prompt.title}</td>
                        <td className="px-4 py-3 text-slate-400">{prompt.category}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEditPrompt(prompt)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded mr-2 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Manage Categories</h2>
              <button
                onClick={() => {
                  resetCategoryForm();
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{category.slug}</p>
                      {category.description && (
                        <p className="text-sm text-slate-500 mt-2">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCategory(category)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Manage Users</h2>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-750">
                        <td className="px-4 py-3 text-white">{user.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-slate-400">{user.email}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {user.subscription_plan === 'monthly' ? 'Monthly' : user.subscription_plan === 'yearly' ? 'Yearly' : 'Free'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_admin ? 'bg-purple-900 text-purple-200' :
                            user.has_paid ? 'bg-green-900 text-green-200' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {user.is_admin ? 'Admin' : user.has_paid ? 'Paid' : 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleUserAdmin(user.id, user.is_admin)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded mr-2 transition-colors"
                          >
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleToggleUserSubscription(user.id, user.has_paid)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            {user.has_paid ? 'Revoke Access' : 'Grant Access'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                {editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={promptForm.title}
                    onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={promptForm.description}
                    onChange={(e) => setPromptForm({ ...promptForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Prompt Text</label>
                  <textarea
                    value={promptForm.prompt_text}
                    onChange={(e) => setPromptForm({ ...promptForm, prompt_text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={promptForm.image_url}
                    onChange={(e) => setPromptForm({ ...promptForm, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={promptForm.category_id}
                    onChange={(e) => setPromptForm({ ...promptForm, category_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSavePrompt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowPromptModal(false);
                    setEditingPrompt(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Slug</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
