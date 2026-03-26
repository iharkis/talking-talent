import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Users, Calendar, BarChart3, Settings, Menu, X, Home, Presentation, MessageSquare } from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { businessAnalystService } from '../services/businessAnalystService';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  active?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

function buildNavSections(isPeople: boolean): NavSection[] {
  return [
    {
      items: [
        { name: 'My Team', icon: Home, path: '/dashboard' },
        { name: 'My Feedback', icon: MessageSquare, path: '/feedback' },
      ]
    },
    ...(isPeople ? [{
      title: 'Admin',
      items: [
        { name: 'Consultants', icon: Users, path: '/consultants' },
        { name: 'Talking Talent Rounds', icon: Calendar, path: '/rounds' },
        { name: 'Session View', icon: Presentation, path: '/session' },
      ]
    }] : []),
    {
      title: 'Insights',
      items: [
        { name: 'History', icon: BarChart3, path: '/history' },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Settings', icon: Settings, path: '/settings' }
      ]
    }
  ];
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { currentUser, isPeople } = useCurrentUser();
  const navSections = buildNavSections(isPeople);
  const currentUserBA = currentUser
    ? businessAnalystService.getById(currentUser.businessAnalystId)
    : null;

  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', handlePathChange);
    
    // Also listen for pushstate events (programmatic navigation)
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handlePathChange();
    };

    return () => {
      window.removeEventListener('popstate', handlePathChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  return (
    <div className="min-h-screen bg-hippo-background">
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-hippo-dark-blue shadow-lg transform transition-transform duration-400 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-hippo-white/20">
          <h1 className="text-xl font-bold text-hippo-white">Talking Talent</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-hippo-white/20 text-hippo-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={cn(sectionIndex > 0 && 'mt-6')}>
              {section.title && (
                <h3 className="text-xs font-semibold text-hippo-white/60 uppercase tracking-wider mb-3 px-4">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                // Handle path matching more robustly
                const currentRoute = currentPath === '/' ? 'dashboard' : currentPath.substring(1);
                const itemRoute = item.path.substring(1);
                const isActive = currentRoute === itemRoute;
                
                return (
                  <a
                    key={item.name}
                    href={item.path}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-hippo-subtle mb-2 transition-all duration-400',
                      isActive
                        ? 'bg-hippo-green text-hippo-white shadow-md'
                        : 'text-hippo-white/80 hover:bg-hippo-green/20 hover:text-hippo-white'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-hippo-green/10 p-4 rounded-hippo-subtle border border-hippo-green/20">
            <p className="text-xs text-hippo-white/70">Version 1.0</p>
            <p className="text-xs text-hippo-white/70">Performance Management System</p>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        <header className="bg-hippo-white shadow-hippo border-b border-hippo-background">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-hippo-subtle text-hippo-text hover:bg-hippo-background"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4 ml-auto">
              {currentUserBA ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-hippo-dark-blue/10 flex items-center justify-center text-hippo-dark-blue font-semibold text-xs">
                    {currentUserBA.firstName[0]}{currentUserBA.lastName[0]}
                  </div>
                  <span className="text-hippo-text/70 font-medium hidden sm:block">
                    {currentUserBA.firstName} {currentUserBA.lastName}
                  </span>
                </div>
              ) : (
                <a href="/settings" className="text-sm text-orange-600 font-medium hover:text-orange-700">
                  Set user in Settings
                </a>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}