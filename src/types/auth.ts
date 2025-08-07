export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  domain: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  auth: AuthState;
  signIn: () => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

export interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  locale?: string;
}

export const ALLOWED_DOMAIN = 'hippodigital.co.uk';

export const AUTH_STORAGE_KEY = 'tt_auth_data';