
import React, { useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  Users,
  UserCircle,
  LogOut,
  Menu,
  Heart,
  Music,
  MessageCircle,
  Gift
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
  coupleName: string;
  onLogout: () => void;
}

const Layout: React.FC<Props> = ({ children, coupleName, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToTop = (e: React.MouseEvent) => {
    // If already on dashboard, just scroll. If not, navigate then scroll.
    if (pathname === '/dashboard') {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'checklist', label: 'Checklist', path: '/dashboard/checklist', icon: <CheckSquare size={20} /> },
    { id: 'budget', label: 'Financeiro', path: '/dashboard/budget', icon: <DollarSign size={20} /> },
    { id: 'guests', label: 'Convidados', path: '/dashboard/guests', icon: <Users size={20} /> },
    { id: 'noivos', label: 'Noivos', path: '/dashboard/couple', icon: <UserCircle size={20} /> },
    { id: 'musicas', label: 'Músicas', path: '/dashboard/music', icon: <Music size={20} /> },
    { id: 'gifts', label: 'Lista de presentes', path: '/dashboard/gifts', icon: <Gift size={20} /> },
  ];

  const { pathname } = useLocation();
  const activeIndex = menuItems.findIndex(item =>
    item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)
  );

  // Reset scroll on every route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-wedding-nude flex">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <NavLink
            to="/dashboard"
            onClick={scrollToTop}
            className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity"
          >
            <Heart className="text-wedding-gold fill-wedding-gold" size={24} />
            <span className="text-2xl font-serif font-bold text-slate-800">Simples Wed</span>
          </NavLink>

          <nav className="flex-1 flex flex-col gap-2 relative">
            {/* Sliding Highlight Indicator */}
            {activeIndex !== -1 && (
              <div
                className="absolute left-0 w-full h-12 bg-wedding-gold rounded-xl shadow-lg shadow-wedding-gold/20 transition-all duration-300 ease-out z-0"
                style={{
                  transform: `translateY(${activeIndex * 56}px)`,
                }}
              />
            )}

            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.id === 'dashboard'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `relative z-10 w-full h-12 flex items-center gap-3 px-4 rounded-xl transition-colors duration-300 font-medium
                  ${isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-wedding-gold'}
                `}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-wedding-gold flex items-center justify-center text-white font-bold">
                {coupleName ? coupleName.charAt(0) : '?'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{coupleName || 'Novo Casamento'}</p>
                <p className="text-xs text-slate-400">Plano Premium</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition group"
            >
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header with Centered Logo */}
        <header className="bg-white border-b border-slate-100 p-4 lg:hidden relative flex items-center justify-between min-h-[64px]">
          <div className="w-10"></div> {/* Spacer to balance menu button */}
          <NavLink
            to="/dashboard"
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Heart className="text-wedding-gold fill-wedding-gold" size={20} />
            <span className="text-xl font-serif font-bold text-slate-800">Simples Wed</span>
          </NavLink>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:text-wedding-gold transition-colors">
            <Menu size={24} />
          </button>
        </header>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 lg:p-10 relative pb-32"
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
