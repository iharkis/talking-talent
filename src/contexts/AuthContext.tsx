import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, AuthContextType, AuthUser } from '../types/auth';
import { authService } from '../services/authService';

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null
};

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedAuth = authService.getStoredAuth();
      
      if (storedAuth) {
        setAuth({
          isAuthenticated: true,
          user: storedAuth.user,
          token: storedAuth.token,
          isLoading: false,
          error: null
        });
      } else {
        setAuth(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: 'Failed to initialize authentication'
      });
    }
  };

  const signIn = async (): Promise<void> => {
    setAuth(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const user: AuthUser = await authService.signIn();
      const storedAuth = authService.getStoredAuth();
      
      setAuth({
        isAuthenticated: true,
        user,
        token: storedAuth?.token || null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      });
    }
  };

  const signOut = async (): Promise<void> => {
    setAuth(prev => ({
      ...prev,
      isLoading: true
    }));

    try {
      await authService.signOut();
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: 'Sign out failed'
      });
    }
  };

  const clearError = (): void => {
    setAuth(prev => ({
      ...prev,
      error: null
    }));
  };

  const contextValue: AuthContextType = {
    auth,
    signIn,
    signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}