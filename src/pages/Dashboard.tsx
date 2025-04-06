
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import AlertsBanner from '@/components/dashboard/AlertsBanner';
import UpgradeToAdmin from '@/components/dashboard/UpgradeToAdmin';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardError from '@/components/dashboard/DashboardError';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

const Dashboard = () => {
  console.log('🔄 [Dashboard] Component rendering start');
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderAttempt, setRenderAttempt] = useState(0);
  
  // Force UI to render if user is authenticated
  useEffect(() => {
    if (user && isAuthenticated && !isReady) {
      console.log('🔄 [Dashboard] User authenticated, forcing ready state');
      setIsReady(true);
    }
  }, [user, isAuthenticated, isReady]);
  
  // Emergency fallback to ensure UI renders
  useEffect(() => {
    console.log('🔄 [Dashboard] Emergency render effect activated');
    
    // Force render after a timeout if we're stuck
    const forceRenderTimer = setTimeout(() => {
      console.log('🔄 [Dashboard] Force render emergency trigger activated');
      setRenderAttempt(prev => prev + 1);
      
      // After a few attempts, force the ready state
      if (renderAttempt >= 1) {
        console.log('🔄 [Dashboard] Forcing ready state after multiple attempts');
        setIsReady(true);
      }
    }, 2000);
    
    return () => clearTimeout(forceRenderTimer);
  }, [renderAttempt]);
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('🔄 [Dashboard] Auth state:', { 
      isAuthenticated, 
      authLoading, 
      hasUser: !!user,
      user: user ? { id: user.id, email: user?.email, role: user.role } : 'No user'
    });
    
    // If we detect user but UI is still not rendering
    if (user && renderAttempt > 1 && !isReady) {
      console.log('🔄 [Dashboard] User detected but UI still not ready. Forcing render...');
      setIsReady(true);
      toast.info('Recuperando interfaz de usuario');
    }
  }, [isAuthenticated, authLoading, user, renderAttempt, isReady]);
  
  // Initialize dashboard data
  useEffect(() => {
    console.log('🔄 [Dashboard] Initialization effect running');
    
    let mounted = true;
    let initTimer: number | undefined;
    
    try {
      console.log("✅ [Dashboard] Starting initialization...");
      
      // Only show loading initially
      if (!isReady) {
        // Add a timeout to detect if initialization is taking too long
        const timeoutId = setTimeout(() => {
          if (mounted) {
            console.error("❌ [Dashboard] Initialization timeout reached");
            if (error === null) {
              setError("La inicialización está tomando demasiado tiempo. Intentando recuperar la interfaz...");
              toast.warning("Intentando recuperar la interfaz...");
              // Force ready state as fallback
              setIsReady(true);
            }
          }
        }, 5000);
        
        // Normal initialization timer - shorter to improve user experience
        initTimer = window.setTimeout(() => {
          if (mounted) {
            console.log("✅ [Dashboard] Initialization completed successfully");
            clearTimeout(timeoutId);
            setIsReady(true);
          }
        }, 500);
      }
      
      return () => {
        mounted = false;
        console.log("🔄 [Dashboard] Cleaning up initialization timers");
        if (initTimer) clearTimeout(initTimer);
      };
    } catch (err) {
      console.error("❌ [Dashboard] Error initializing dashboard:", err);
      toast.error("Error cargando el dashboard");
      if (mounted) {
        setError("Error al cargar el dashboard. Por favor, recargue la página.");
        // Force ready state to show error UI
        setIsReady(true);
      }
      return () => {
        mounted = false;
      };
    }
  }, [error, isReady]);
  
  // Log render decisions
  if (error) {
    console.log('🔄 [Dashboard] Rendering error state:', error);
  } else if (!isReady) {
    console.log('🔄 [Dashboard] Rendering loading state, isReady:', isReady);
  } else {
    console.log('🔄 [Dashboard] Rendering normal dashboard, user:', !!user);
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <Layout>
        <DashboardError error={error} />
      </Layout>
    );
  }

  // Show loading state until ready
  if (!isReady) {
    return (
      <Layout>
        <DashboardLoading />
      </Layout>
    );
  }

  // Emergency fallback if user is still null but we're technically ready
  if (!user && renderAttempt > 0) {
    console.log('⚠️ [Dashboard] Emergency fallback - no user but rendering empty dashboard shell');
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <p className="text-amber-800">Recuperando datos de usuario...</p>
            <p className="text-sm text-amber-700 mt-2">Si este mensaje persiste, intente recargar la página.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Normal dashboard render
  console.log('🔄 [Dashboard] Rendering complete dashboard UI');
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {/* Banner de actualización a Admin */}
        <UpgradeToAdmin />
        
        {/* Alertas y notificaciones */}
        <AlertsBanner />
        
        {/* Dashboard Content (Stats and Cards) */}
        <DashboardContent />
      </div>
    </Layout>
  );
};

export default Dashboard;
