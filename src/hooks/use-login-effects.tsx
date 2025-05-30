
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

export function useLoginEffects() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [hasErrors, setHasErrors] = useState(false);

  // Detailed debug logging
  useEffect(() => {
    console.log("Login page mount/update - Auth state:", {
      isAuthenticated, 
      isLoading, 
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null
    });
    
    // Force showContent to true if taking too long
    const forceContentTimer = setTimeout(() => {
      if (!showContent) {
        console.log("Forcing showContent to true after timeout");
        setShowContent(true);
      }
    }, 2000);
    
    return () => clearTimeout(forceContentTimer);
  }, [isAuthenticated, isLoading, user, showContent]);

  // Show content after a brief delay to avoid flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check for auth-related URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const message = params.get('message');
    
    if (error) {
      console.log("Login page: URL contiene error:", error);
      setHasErrors(true);
      toast.error('Error de autenticación', {
        description: message || error,
      });
    } else if (message) {
      console.log("Login page: URL contiene mensaje:", message);
      toast.success('Información', {
        description: message,
      });
    }
    
    console.log("Login page loaded, isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "user:", user);
    
    // Verificando estado del localStorage
    try {
      localStorage.setItem('login_test', 'test');
      const testValue = localStorage.getItem('login_test');
      console.log("Login page: LocalStorage test:", testValue === 'test' ? "funcionando" : "valor incorrecto");
      localStorage.removeItem('login_test');
    } catch (e) {
      console.error("Login page: LocalStorage no funciona:", e);
      setHasErrors(true);
    }
    
    // Verificar la conexión a Supabase
    const testSupabaseConnection = async () => {
      try {
        const response = await fetch('https://imcxvnivqrckgjrimzck.supabase.co/auth/v1/health');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Login page: Conexión a Supabase health check:", { data, status: "ok" });
      } catch (err) {
        console.error("Login page: Error verificando conexión a Supabase:", err);
        setHasErrors(true);
      }
    };
    
    testSupabaseConnection();
  }, [isAuthenticated, isLoading, user]);

  // CENTRALIZADA: Handle redirection with a small delay to ensure context is fully initialized
  useEffect(() => {
    let redirectTimeout: number | undefined;
    
    console.log("Redirect effect triggered - Auth state check:", { 
      isAuthenticated, 
      isLoading,
      redirectAttempts,
      user: user ? { id: user.id, email: user.email, role: user.role } : null
    });
    
    if (isAuthenticated && !isLoading && user) {
      console.log("User is authenticated, preparing to redirect to dashboard...");
      
      // Use a small timeout to ensure auth state is stable
      redirectTimeout = window.setTimeout(() => {
        console.log("Executing redirect to dashboard now for user:", user.email);
        navigate('/dashboard', { replace: true });
      }, 500); // Increased timeout to ensure state is fully processed
      
    } else if (!isLoading && !isAuthenticated && redirectAttempts < 5) {
      console.log(`Not authenticated but not loading (attempt ${redirectAttempts}), will check again in case of race condition`);
      // En caso de que haya una condición de carrera, intentar de nuevo después de un breve tiempo
      redirectTimeout = window.setTimeout(() => {
        setRedirectAttempts(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (redirectTimeout) {
        console.log("Cleaning up redirect timeout");
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [isAuthenticated, isLoading, navigate, user, redirectAttempts]);

  // Network connectivity check
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      if (!navigator.onLine) {
        setHasErrors(true);
        toast.error('Error de conexión', {
          description: 'Se ha perdido la conexión a internet',
        });
      } else {
        console.log("Conexión a internet restaurada");
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Verificar estado actual de conexión
    console.log("Estado actual de conexión:", navigator.onLine ? "Online" : "Offline");
    if (!navigator.onLine) {
      setHasErrors(true);
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    activeTab,
    setActiveTab,
    showContent,
    hasErrors,
    redirectAttempts
  };
}
