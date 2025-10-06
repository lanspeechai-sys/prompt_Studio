import { useAuth } from '../contexts/AuthContext';
import { Camera, LogOut, Home, LayoutDashboard, Settings } from 'lucide-react';

interface NavigationProps {
  currentPage: 'home' | 'dashboard' | 'admin';
  onNavigate: (page: 'home' | 'dashboard' | 'admin') => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { profile, signOut } = useAuth();

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
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

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onNavigate('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              {profile?.is_admin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'admin'
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
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

        <div className="md:hidden flex items-center gap-2 pb-3">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              currentPage === 'home'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              currentPage === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          {profile?.is_admin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                currentPage === 'admin'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Admin
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
