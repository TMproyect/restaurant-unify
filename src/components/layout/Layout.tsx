
import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
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
