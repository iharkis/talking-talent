import { useState } from 'react';
import { cn } from '../utils/cn';
import { Users, Calendar, ClipboardList, BarChart3, Settings, Menu, X, Play } from 'lucide-react';

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

const navSections: NavSection[] = [
  {
    items: [
      { name: 'Dashboard', icon: BarChart3, path: '/dashboard' }
    ]
  },
  {
    title: 'Planning & Setup',
    items: [
      { name: 'Business Analysts', icon: Users, path: '/bas' },
      { name: 'Talking Talent Rounds', icon: Calendar, path: '/rounds' }
    ]
  },
  {
    title: 'Reviews',
    items: [
      { name: 'Talking Talent Session', icon: Play, path: '/session' },
      { name: 'Reviews', icon: ClipboardList, path: '/reviews' }
    ]
  },
  {
    title: 'History & Settings',
    items: [
      { name: 'History', icon: BarChart3, path: '/history' },
      { name: 'Settings', icon: Settings, path: '/settings' }
    ]
  }
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = window.location.pathname;

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
                const isActive = currentPath === item.path || (currentPath === '/' && item.path === '/dashboard');
                
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
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-hippo-text/70 font-medium">
                {new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
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