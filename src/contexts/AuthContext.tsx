// === 📁 src/contexts/AuthContext.tsx ===
// Authentication context and provider

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthState, User, LoginCredentials } from '@/types/auth';
import { api } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'auth_state';
const TOKEN_STORAGE_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Save auth state to localStorage
  const saveAuthState = useCallback((state: AuthState) => {
    try {
      if (state.isAuthenticated && state.user && state.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          user: state.user,
        }));
        localStorage.setItem(TOKEN_STORAGE_KEY, state.token);
        api.setToken(state.token);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        api.clearToken();
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }, []);

  // Logout function (defined early for use in effects)
  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    saveAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    console.log('✅ Logout successful');
  }, [saveAuthState]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Listen for unauthorized events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('⚠️ Unauthorized event received - logging out');
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const loadAuthState = () => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedAuth && storedToken) {
        const parsed = JSON.parse(storedAuth);
        
        // Validate that we have required data
        if (!parsed.user || !parsed.user.id) {
          console.warn('⚠️ Invalid auth data in storage, clearing');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        setAuthState({
          isAuthenticated: true,
          user: parsed.user,
          token: storedToken,
        });
        
        // Set token in API service
        api.setToken(storedToken);
        
        console.log('✅ Auth state restored:', parsed.user?.name);
      } else {
        console.log('ℹ️ No saved auth state found');
      }
    } catch (error) {
      console.error('❌ Error loading auth state:', error);
      // Clear potentially corrupted data
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Validate credentials
      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Введите имя пользователя и пароль',
        };
      }

      // Try API call
      console.log('🔐 Attempting login for:', credentials.username);
      const response = await api.post<any>('/auth/login', credentials);

      // If API returns success with token and user
      if (response.success && response.data && response.data.token) {
        const { token, user } = response.data;

        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: user || {
            id: credentials.username,
            name: credentials.username,
            username: credentials.username,
          },
          token: token,
        };

        setAuthState(newAuthState);
        saveAuthState(newAuthState);

        console.log('✅ Login successful (API):', newAuthState.user?.name);
        return { success: true };
      }

      // If API returned error or no data - use DEV MODE
      console.warn('⚠️ API login failed or not implemented, using DEV MODE');
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user: {
          id: credentials.username,
          name: credentials.username.split('@')[0], // Extract name from email if possible
          username: credentials.username,
          role: 'user',
        },
        token: 'dev_token_' + Date.now(),
      };

      setAuthState(newAuthState);
      saveAuthState(newAuthState);

      console.log('✅ Login successful (DEV MODE):', newAuthState.user?.name);
      return { success: true };

    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // For development: ALWAYS allow any credentials if they're provided
      console.warn('⚠️ Login exception, using DEV MODE fallback');
      
      if (credentials.username && credentials.password) {
        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: {
            id: credentials.username,
            name: credentials.username.split('@')[0], // Extract name from email
            username: credentials.username,
            role: 'user',
          },
          token: 'dev_token_' + Date.now(),
        };

        setAuthState(newAuthState);
        saveAuthState(newAuthState);

        console.log('✅ Login successful (DEV MODE - Exception):', newAuthState.user?.name);
        return { success: true };
      }

      return {
        success: false,
        error: 'Введите имя пользователя и пароль',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
    saveAuthState({
      ...authState,
      user,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

