// === 📁 src/components/ProtectedRoute.tsx ===
// Protected route wrapper for authenticated routes

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configService } from '@/services/configService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, loginDemo } = useAuth();
  const isConfigured = configService.isConfigured();
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Auto-login in demo mode if not authenticated
  useEffect(() => {
    if (isConfigured && !isLoading && !isAuthenticated && !autoLoginAttempted) {
      console.log('🔄 Auto-logging in demo mode...');
      loginDemo();
      setAutoLoginAttempted(true);
    }
  }, [isConfigured, isLoading, isAuthenticated, autoLoginAttempted, loginDemo]);

  // Show loading state while checking auth or attempting auto-login
  if (isLoading || (isConfigured && !isAuthenticated && !autoLoginAttempted)) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <p className="text-xl text-content-secondary">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if not configured
  if (!isConfigured) {
    console.warn('⚠️ Not configured, redirecting to /setup');
    return <Navigate to="/setup" replace />;
  }

  // Allow access if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If we got here, something went wrong with auto-login
  // Show loading screen to prevent rendering errors
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">📦</div>
        <p className="text-xl text-content-secondary">Вход в систему...</p>
      </div>
    </div>
  );
};

export default ProtectedRoute;

