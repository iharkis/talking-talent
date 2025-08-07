import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { AlertCircle, Shield, Users } from 'lucide-react';

export function LoginScreen() {
  const { auth, signIn, clearError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isDevelopmentMode = authService.isDevelopmentMode();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    clearError();
    
    try {
      await signIn();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-hippo-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-hippo-dark-blue p-3 rounded-hippo-subtle">
                <Users className="h-8 w-8 text-hippo-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-hippo-text mb-2">Talking Talent</h1>
            <p className="text-hippo-text/70">Performance Management System</p>
          </div>

          {isDevelopmentMode && (
            <div className="bg-hippo-green/10 border border-hippo-green/20 rounded-hippo-subtle p-4 mb-6">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-hippo-green mr-2" />
                <div>
                  <p className="text-sm font-medium text-hippo-green">Development Mode</p>
                  <p className="text-xs text-hippo-green/80">Using mock authentication for testing</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="bg-hippo-background border border-hippo-background rounded-hippo-subtle p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-hippo-text/60 mr-3" />
                <div>
                  <p className="text-sm font-medium text-hippo-text">Restricted Access</p>
                  <p className="text-xs text-hippo-text/70">
                    Only @hippodigital.co.uk email addresses are permitted
                  </p>
                </div>
              </div>
            </div>
          </div>

          {auth.error && (
            <div className="bg-red-50 border border-red-200 rounded-hippo-subtle p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">Access Denied</p>
                  <p className="text-xs text-red-600 mt-1">{auth.error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isSigningIn || auth.isLoading}
            className="w-full bg-hippo-dark-blue hover:bg-hippo-dark-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-hippo-white font-medium py-3 px-4 rounded-hippo-subtle transition-all duration-400 flex items-center justify-center"
          >
            {isSigningIn ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-hippo-white border-t-transparent mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isDevelopmentMode ? 'Sign in (Development)' : 'Sign in with Google'}
              </div>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-hippo-text/50">
              By signing in, you agree to use this system in accordance with Hippo Digital policies
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-hippo-text/50">
            Version 1.0 - Performance Management System
          </p>
        </div>
      </div>
    </div>
  );
}