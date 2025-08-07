import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from './LoginScreen';
import { Users } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-hippo-background flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-hippo-dark-blue p-4 rounded-hippo-subtle">
            <Users className="h-8 w-8 text-hippo-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-hippo-text mb-4">Talking Talent</h1>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-hippo-dark-blue border-t-transparent mr-3"></div>
          <span className="text-hippo-text/70">Loading...</span>
        </div>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { auth } = useAuth();

  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  if (!auth.isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}