import { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { BAManagement } from './BAManagement';
import { RoundManagement } from './RoundManagement';
import { ReviewEntry } from './ReviewEntry';
import { SessionMode } from './SessionMode';
import { Settings } from './Settings';
import { HistoricalAnalysis } from './HistoricalAnalysis';

type Route = 'dashboard' | 'bas' | 'rounds' | 'reviews' | 'session' | 'history' | 'settings';

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const route = path.substring(1) || 'dashboard';
      setCurrentRoute(route as Route);
    };

    handlePopState();
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = target.pathname;
        const route = path.substring(1) || 'dashboard';
        setCurrentRoute(route as Route);
        window.history.pushState({}, '', path);
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const renderComponent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'bas':
        return <BAManagement />;
      case 'rounds':
        return <RoundManagement />;
      case 'reviews':
        return <ReviewEntry />;
      case 'session':
        return <SessionMode />;
      case 'history':
        return <HistoricalAnalysis />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return renderComponent();
}

