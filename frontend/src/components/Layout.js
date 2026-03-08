import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Home, Receipt, Calendar, Sparkles, Target, LogOut, Wallet } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Receipt, label: 'Expenses', path: '/expenses' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Sparkles, label: 'AI Insights', path: '/insights' },
    { icon: Target, label: 'Budgets', path: '/budgets' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">FinanceAI</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'secondary' : 'ghost'}
              className={`w-full justify-start h-11 ${isActive(item.path) ? 'bg-secondary' : ''}`}
              onClick={() => navigate(item.path)}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5 mr-3" strokeWidth={1.5} />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4 flex justify-around z-50">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 ${
              isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
            }`}
            data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;