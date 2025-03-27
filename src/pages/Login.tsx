
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { toast } from 'sonner';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

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
      toast.error('Error de autenticación', {
        description: message || error,
      });
    } else if (message) {
      toast.success('Información', {
        description: message,
      });
    }
    
    console.log("Login page loaded, isAuthenticated:", isAuthenticated, "isLoading:", isLoading);
  }, []);

  // Handle redirection - with a small delay to ensure context is fully initialized
  useEffect(() => {
    let redirectTimeout: number | undefined;
    
    if (isAuthenticated && !isLoading) {
      console.log("User is authenticated, preparing to redirect to dashboard...");
      
      // Use a small timeout to ensure auth state is stable
      redirectTimeout = window.setTimeout(() => {
        console.log("Executing redirect to dashboard now");
        navigate('/dashboard', { replace: true });
      }, 500);
    }
    
    return () => {
      if (redirectTimeout) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [isAuthenticated, isLoading, navigate]);

  // Network connectivity check
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      if (!navigator.onLine) {
        toast.error('Error de conexión', {
          description: 'Se ha perdido la conexión a internet',
        });
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Show loading indicator
  if (isLoading || !showContent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg mb-2">Cargando...</p>
          <div className="h-2 w-64 bg-gray-200 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login content
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
              <LoginForm 
                onSuccess={() => {
                  console.log("LoginForm success callback executed, preparing to navigate");
                  // Use a small timeout to ensure state updates have processed
                  setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                  }, 300);
                }}
              />
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
