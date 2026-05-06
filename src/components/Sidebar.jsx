import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ClipboardList, 
  Database, 
  CreditCard, 
  ShoppingBag,
  LogOut,
  ClipboardEdit,
  Clock,
  ShieldAlert,
  Settings,
  PieChart,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isOpen, onClose }) {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Assign Work', path: '/assign-work', icon: ClipboardList },
    { name: 'Master Data', path: '/master-data', icon: Database },
    { name: 'Card Details', path: '/card-details', icon: CreditCard },
    { name: 'Bag', path: '/bags', icon: ShoppingBag },
    { name: 'Work Audit', path: '/work-audit', icon: ShieldAlert },
    { name: 'Reports', path: '/reports', icon: PieChart },
  ];

  const operatorLinks = [
    { name: 'Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
    { name: 'Work Log', path: '/operator/work-log', icon: Clock },
    { name: 'Edit Work', path: '/operator/edit-work', icon: ClipboardEdit },
  ];

  const links = user?.role === 'admin' ? adminLinks : operatorLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "w-64 bg-sidebar min-h-screen text-gray-300 flex flex-col fixed left-0 top-0 bottom-0 border-r border-gray-800 transition-transform duration-300 shadow-[2px_0_15px_rgba(0,0,0,0.5)] z-50",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-center relative">
          <div className="flex flex-col items-center">
            <span className="flex items-center text-3xl font-black tracking-tighter uppercase leading-none text-white">
              N<Settings className="w-6 h-6 mx-[1px] stroke-[3]" />BEL
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest mt-1 text-accent">Live Lighter Live Stronger</span>
          </div>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                if (onClose) onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-accent/10 text-accent" 
                  : "hover:bg-gray-800/50 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              {link.name}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="px-4 py-3 mb-2 rounded-xl bg-gray-800/30">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
    </>
  );
}
