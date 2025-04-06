
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Debug log for layout rendering
  console.log('🔄 [Layout] Rendering with auth state:', { isAuthenticated, isLoading, user: user?.email });

  // Detect session issues
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      console.log('🔄 [Layout] User not authenticated, redirecting to login');
      toast.error('Sesión no válida', {
        description: 'Por favor inicie sesión para continuar'
      });
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate]);

  // Show loading indicator if auth is still loading
  if (isLoading) {
    console.log('🔄 [Layout] Auth still loading');
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="h-6 w-6 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🔄 [Layout] Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If no authentication required or user is authenticated, render the layout
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isAuthenticated && <Sidebar />}
      <div className={cn(
        "flex flex-col flex-1 overflow-hidden",
        isMobile && "w-full"
      )}>
        {isAuthenticated && <Header />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary/30">
          <div className="page-transition">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Add missing cn import
import { cn } from '@/lib/utils';

export default Layout;
