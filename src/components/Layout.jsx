import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppContext } from '../context/AppContext';
import { Menu, Settings } from 'lucide-react';

export function Layout({ allowedRoles }) {
  const { user } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/operator/dashboard'} replace />;
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-sidebar/95 backdrop-blur z-20 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center text-xl font-black tracking-tighter uppercase leading-none text-white">
              N<Settings className="w-4 h-4 mx-[0.5px] stroke-[3]" />BEL
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
