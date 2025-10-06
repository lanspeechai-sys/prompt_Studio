import { useState } from 'react';
import { Navigation } from './Navigation';
import { HomePage } from './HomePage';
import { UserDashboard } from './UserDashboard';
import { AdminPanel } from './admin/AdminPanel';

export function MainApp() {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'admin'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'dashboard' && <UserDashboard />}
      {currentPage === 'admin' && <AdminPanel />}
    </div>
  );
}
