// === 📁 src/components/ProtectedRoute.tsx ===
// Protected route wrapper for authenticated routes

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configService } from '@/services/configService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const isConfigured = configService.isConfigured();
  const location = useLocation();

  // Log protection check
  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', {
      path: location.pathname,
      isConfigured,
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      isLoading,
    });
  }, [location.pathname, isConfigured, isAuthenticated, user, token, isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#343436] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <p className="text-xl text-[#a7a7a7]">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if not configured
  if (!isConfigured) {
    console.warn('⚠️ Not configured, redirecting to /setup');
    return <Navigate to="/setup" replace />;
  }

  // Strict authentication check
  if (!isAuthenticated || !user || !token) {
    console.warn('⚠️ Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

