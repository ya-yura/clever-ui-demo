// === 📁 src/contexts/AuthContext.tsx ===
// Authentication context and provider

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Load auth state from localStorage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = () => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedAuth && storedToken) {
        const parsed = JSON.parse(storedAuth);
        setAuthState({
          isAuthenticated: true,
          user: parsed.user,
          token: storedToken,
        });
        
        // Set token in API service
        api.setToken(storedToken);
        
        console.log('✅ Auth state restored:', parsed.user?.name);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthState = (state: AuthState) => {
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
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // For now, simulate API call
      const response = await api.post<any>('/auth/login', credentials);

      if (response.success && response.data) {
        const { token, user } = response.data;

        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: user || {
            id: credentials.username,
            name: credentials.username,
            username: credentials.username,
          },
          token: token || 'mock_token_' + Date.now(),
        };

        setAuthState(newAuthState);
        saveAuthState(newAuthState);

        console.log('✅ Login successful:', newAuthState.user?.name);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Ошибка авторизации',
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // For development: allow any credentials
      if (credentials.username && credentials.password) {
        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: {
            id: credentials.username,
            name: credentials.username,
            username: credentials.username,
            role: 'user',
          },
          token: 'dev_token_' + Date.now(),
        };

        setAuthState(newAuthState);
        saveAuthState(newAuthState);

        console.log('✅ Login successful (dev mode):', newAuthState.user?.name);
        return { success: true };
      }

      return {
        success: false,
        error: error.message || 'Ошибка подключения к серверу',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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

