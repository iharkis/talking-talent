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

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { name: 'Session Mode', icon: Play, path: '/session' },
  { name: 'Business Analysts', icon: Users, path: '/bas' },
  { name: 'Talent Rounds', icon: Calendar, path: '/rounds' },
  { name: 'Reviews', icon: ClipboardList, path: '/reviews' },
  { name: 'History', icon: BarChart3, path: '/history' },
  { name: 'Settings', icon: Settings, path: '/settings' }
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Talking Talent</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (currentPath === '/' && item.path === '/dashboard');
            
            return (
              <a
                key={item.name}
                href={item.path}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            );
          })}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Version 1.0</p>
            <p className="text-xs text-gray-500">Performance Management System</p>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
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

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}