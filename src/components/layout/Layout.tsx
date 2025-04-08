
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [renderAttempt, setRenderAttempt] = useState(0);
  const [showEmergencyContent, setShowEmergencyContent] = useState(false);
  
  // Use ref to prevent multiple timers and effect loops
  const timerRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Debug log for layout rendering - Only log on first mount or changes to auth state
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('🔄 [Layout] Initial rendering with auth state:', { 
        isAuthenticated, 
        isLoading, 
        user: user?.email,
        renderAttempt 
      });
      isInitialMount.current = false;
    }
  }, [isAuthenticated, isLoading, user, renderAttempt]);
  
  // Emergency timer to ensure UI always renders something, with safeguards
  useEffect(() => {
    // Only set the timer once
    if (timerRef.current === null) {
      console.log('🔄 [Layout] Emergency render effect activated once');
      
      // Force render after a timeout if we're stuck
      timerRef.current = window.setTimeout(() => {
        console.log('🔄 [Layout] Emergency render timer triggered, attempt:', renderAttempt + 1);
        setRenderAttempt(prev => prev + 1);
        
        if (renderAttempt >= 2 && !isAuthenticated) {
          console.log('🔄 [Layout] Activating emergency content render');
          setShowEmergencyContent(true);
        }
        
        // Clear ref to allow a new timer on next mount if needed
        timerRef.current = null;
      }, 5000); // Longer timeout for reduced frequency
    }
    
    return () => {
      // Clean up timer on unmount
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once on mount

  // Reset emergency content when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 [Layout] User authenticated, hiding emergency content');
      setShowEmergencyContent(false);
    }
  }, [isAuthenticated, user]);

  // Detect session issues - only run when auth state changes
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
  if (isLoading && renderAttempt < 2) {
    console.log('🔄 [Layout] Auth still loading, renderAttempt:', renderAttempt);
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="h-6 w-6 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">Verificando sesión...</p>
          {renderAttempt > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Esto está tomando más tiempo de lo esperado...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Handle emergency content render
  if (showEmergencyContent && !isAuthenticated) {
    console.log('🔄 [Layout] Showing emergency content');
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary/30">
            <div className="page-transition">
              <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Recuperando estado de la aplicación</h2>
                <p className="text-gray-700 mb-4">
                  Estamos experimentando dificultades para cargar la interfaz correctamente.
                </p>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
                  <p className="text-amber-800 font-medium">Recomendaciones:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-amber-700">
                    <li>Intente recargar la página</li>
                    <li>Verifique su conexión a internet</li>
                    <li>Intente iniciar sesión nuevamente</li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Recargar página
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  >
                    Ir a inicio de sesión
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated && !isLoading) {
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

export default Layout;
