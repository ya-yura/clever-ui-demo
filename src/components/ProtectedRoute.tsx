// === 📁 src/components/ProtectedRoute.tsx ===
// Protected route wrapper for authenticated routes

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configService } from '@/services/configService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isDemo } = useAuth();
  const isConfigured = configService.isConfigured();
  const location = useLocation();
  
  // Check if demo mode is enabled
  const demoModeEnabled = localStorage.getItem('demo_mode') === 'true';

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

  // Allow access in demo mode without configuration
  if (demoModeEnabled || isDemo) {
    console.log('✅ Demo mode enabled, bypassing configuration check');
    return <>{children}</>;
  }

  // Redirect to setup if not configured
  if (!isConfigured) {
    console.warn('⚠️ Not configured, redirecting to /setup');
    return <Navigate to="/setup" replace />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.warn('⚠️ Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

