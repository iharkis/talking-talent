import { AuthUser, GoogleAuthResponse, GoogleUserInfo, ALLOWED_DOMAIN, AUTH_STORAGE_KEY } from '../types/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DEVELOPMENT_MODE = import.meta.env.DEV || !GOOGLE_CLIENT_ID;

interface StoredAuthData {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

class AuthService {
  private isGoogleLoaded = false;

  async initializeGoogleAuth(): Promise<void> {
    if (DEVELOPMENT_MODE) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (this.isGoogleLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/gapi.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.gapi.load('auth2', async () => {
          try {
            await window.gapi.auth2.init({
              client_id: GOOGLE_CLIENT_ID,
            });
            this.isGoogleLoaded = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = () => reject(new Error('Failed to load Google Auth'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<AuthUser> {
    if (DEVELOPMENT_MODE) {
      return this.mockSignIn();
    }

    await this.initializeGoogleAuth();
    
    const authInstance = window.gapi.auth2.getAuthInstance();
    const googleUser = await authInstance.signIn();
    
    const profile = googleUser.getBasicProfile();
    const email = profile.getEmail();
    const domain = email.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      await authInstance.signOut();
      throw new Error(`Access denied. Only ${ALLOWED_DOMAIN} email addresses are allowed.`);
    }

    const user: AuthUser = {
      id: profile.getId(),
      email: email,
      name: profile.getName(),
      picture: profile.getImageUrl(),
      domain: domain
    };

    const authResponse = googleUser.getAuthResponse();
    this.storeAuthData(user, authResponse.access_token, authResponse.expires_in);

    return user;
  }

  async signOut(): Promise<void> {
    if (DEVELOPMENT_MODE) {
      this.clearStoredAuth();
      return;
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    } catch (error) {
      console.error('Google sign out error:', error);
    } finally {
      this.clearStoredAuth();
    }
  }

  getStoredAuth(): { user: AuthUser; token: string } | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const authData: StoredAuthData = JSON.parse(stored);
      
      if (Date.now() > authData.expiresAt) {
        this.clearStoredAuth();
        return null;
      }

      return {
        user: authData.user,
        token: authData.token
      };
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      this.clearStoredAuth();
      return null;
    }
  }

  private storeAuthData(user: AuthUser, token: string, expiresIn: number): void {
    try {
      const authData: StoredAuthData = {
        user,
        token,
        expiresAt: Date.now() + (expiresIn * 1000) - (5 * 60 * 1000) // 5 min buffer
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private async mockSignIn(): Promise<AuthUser> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUsers = [
      {
        id: 'mock-user-1',
        email: 'test.user@hippodigital.co.uk',
        name: 'Test User',
        picture: undefined,
        domain: 'hippodigital.co.uk'
      }
    ];

    const user = mockUsers[0];
    this.storeAuthData(user, 'mock-token-' + Date.now(), 3600);
    
    return user;
  }

  isDevelopmentMode(): boolean {
    return DEVELOPMENT_MODE;
  }
}

declare global {
  interface Window {
    gapi: any;
  }
}

export const authService = new AuthService();