'use client';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRoles,
  requireAuth = true
}: ProtectedRouteProps) {
  const { isAuthenticated, hasAnyRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (requireAuth && !isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Check role authorization
      if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requiredRoles, hasAnyRole, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg-primary">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 theme-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not authorized
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}
