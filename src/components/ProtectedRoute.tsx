// === 📁 src/components/ProtectedRoute.tsx ===
// Protected route wrapper for authenticated routes
//
// SECURITY NOTE: This component provides UX-only protection.
// Real security is enforced server-side by the Cleverence Mobile SMARTS OAuth2 server.
// The server validates JWT tokens and user roles on every API request.
// Client-side checks here are for better UX (hiding UI elements) but can be bypassed.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configService } from '@/services/configService';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isDemo } = useAuth();
  const isConfigured = configService.isConfigured();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <p className="text-xl text-content-secondary">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if not configured and not in demo mode
  if (!isConfigured && !isDemo) {
    logger.warn('⚠️ Not configured, redirecting to /setup');
    return <Navigate to="/setup" replace />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    logger.warn('⚠️ Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

