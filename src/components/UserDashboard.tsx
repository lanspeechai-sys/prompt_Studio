import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Calendar, CreditCard, Check } from 'lucide-react';

export function UserDashboard() {
  const { profile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) {
      setMessage('Error updating profile');
    } else {
      setMessage('Profile updated successfully');
    }

    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const getExpirationDate = () => {
    if (!profile?.subscription_expires_at) return null;
    return new Date(profile.subscription_expires_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRenewalDate = () => {
    if (!profile?.subscription_started_at) return null;
    const startDate = new Date(profile.subscription_started_at);
    if (profile.subscription_plan === 'monthly') {
      startDate.setMonth(startDate.getMonth() + 1);
    } else if (profile.subscription_plan === 'yearly') {
      startDate.setFullYear(startDate.getFullYear() + 1);
    }
    return startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isSubscriptionActive = () => {
    if (!profile?.subscription_expires_at) return false;
    return new Date(profile.subscription_expires_at) > new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400">Manage your profile and subscription</p>
        </div>

        <div className="grid gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('success')
                    ? 'bg-green-900 text-green-200'
                    : 'bg-red-900 text-red-200'
                }`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Subscription</h2>
            </div>

            {profile?.has_paid ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Active Subscription</p>
                      <p className="text-green-200 text-sm">
                        {profile.subscription_plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-2xl">
                      {profile.subscription_plan === 'monthly' ? '$1' : '$5'}
                    </p>
                    <p className="text-green-200 text-sm">
                      per {profile.subscription_plan === 'monthly' ? 'month' : 'year'}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-400">Started On</p>
                    </div>
                    <p className="text-white font-semibold">
                      {profile.subscription_started_at
                        ? new Date(profile.subscription_started_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-400">Renewal Date</p>
                    </div>
                    <p className="text-white font-semibold">
                      {getRenewalDate() || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <h3 className="text-white font-semibold mb-3">Plan Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Access to entire prompt library</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>New prompts added regularly</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>High-quality professional prompts</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Copy prompts with one click</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-slate-900 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400 mb-4">
                    You currently don't have an active subscription
                  </p>
                  <p className="text-white text-lg font-semibold mb-6">
                    Choose a plan to unlock all features
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
                      <p className="text-white font-bold text-2xl mb-1">$1</p>
                      <p className="text-slate-400 text-sm mb-3">per month</p>
                      <p className="text-xs text-slate-500">Billed monthly</p>
                    </div>
                    <div className="p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
                      <div className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-2">
                        BEST VALUE
                      </div>
                      <p className="text-white font-bold text-2xl mb-1">$5</p>
                      <p className="text-blue-200 text-sm mb-3">per year</p>
                      <p className="text-xs text-blue-300">Save 58%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
