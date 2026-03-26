import { useState, useEffect } from 'react';
import { MyTeam } from './MyTeam';
import { BAManagement } from './BAManagement';
import { RoundManagement } from './RoundManagement';
import { ReviewEntry } from './ReviewEntry';
import { Settings } from './Settings';
import { HistoricalAnalysis } from './HistoricalAnalysis';
import { SessionView } from './SessionView';
import { MyFeedback } from './MyFeedback';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ShieldOff } from 'lucide-react';

type Route = 'dashboard' | 'consultants' | 'rounds' | 'reviews' | 'session' | 'feedback' | 'history' | 'settings';

function AccessDenied() {
  return (
    <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-12 text-center">
      <ShieldOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-sm font-medium text-hippo-dark-text">Access restricted</h3>
      <p className="mt-1 text-sm text-hippo-dark-text/60">You don't have permission to view this page.</p>
    </div>
  );
}

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const { isPeople } = useCurrentUser();

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
        return <MyTeam />;
      case 'consultants':
        return isPeople ? <BAManagement /> : <AccessDenied />;
      case 'rounds':
        return isPeople ? <RoundManagement /> : <AccessDenied />;
      case 'session':
        return isPeople ? <SessionView /> : <AccessDenied />;
      case 'feedback':
        return <MyFeedback />;
      case 'reviews':
        return <ReviewEntry />;
      case 'history':
        return <HistoricalAnalysis />;
      case 'settings':
        return <Settings />;
      default:
        return <MyTeam />;
    }
  };

  return renderComponent();
}

