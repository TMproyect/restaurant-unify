
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { toast } from 'sonner';

const Login = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

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
  }, [isAuthenticated, isLoading, user]);

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
    }
    
    // Verificar la conexión a Supabase
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await fetch('https://imcxvnivqrckgjrimzck.supabase.co/auth/v1/health')
          .then(res => res.json());
        console.log("Login page: Conexión a Supabase health check:", { data, error, status: "ok" });
      } catch (err) {
        console.error("Login page: Error verificando conexión a Supabase:", err);
      }
    };
    
    testSupabaseConnection();
  }, []);

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
      }, 300); // Increased timeout to ensure state is fully processed
    } else if (!isLoading && !isAuthenticated && redirectAttempts < 3) {
      console.log("Not authenticated but not loading, will check again in case of race condition");
      // En caso de que haya una condición de carrera, intentar de nuevo después de un breve tiempo
      redirectTimeout = window.setTimeout(() => {
        setRedirectAttempts(prev => prev + 1);
      }, 500);
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

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Show loading indicator
  if (isLoading || !showContent) {
    console.log("Showing loading state on Login page");
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg mb-2">Cargando...</p>
          <div className="h-2 w-64 bg-gray-200 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Conectando con el servidor...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, we should not render this page but be redirected
  if (isAuthenticated && user) {
    console.log("User is authenticated on Login page, should be redirected soon...", user);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg mb-2">Sesión iniciada</p>
          <p className="mb-2">Redirigiendo al dashboard...</p>
          <div className="h-2 w-64 bg-gray-200 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login content
  console.log("Rendering login form, isAuthenticated:", isAuthenticated);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">RestaurantOS</CardTitle>
            <CardDescription>Plataforma unificada de gestión</CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </Card>
        
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Sistema de gestión unificado para restaurantes
        </p>
      </div>
    </div>
  );
};

export default Login;
