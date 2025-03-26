
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
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Mostrar el contenido después de un breve retraso para evitar parpadeos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check for auth-related URL parameters (for email verification, etc.)
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

  // Handle redirection with safety mechanism
  useEffect(() => {
    if (!isLoading && isAuthenticated && !redirectAttempted) {
      console.log("User is authenticated, redirecting to dashboard");
      setRedirectAttempted(true);
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, redirectAttempted]);

  // Mejorado el estado de carga con un timeout de seguridad más rápido (1 segundo)
  useEffect(() => {
    // Safety timeout - si después de 1 segundo seguimos cargando, mostrar la página de login de todos modos
    if (isLoading) {
      const safetyTimer = setTimeout(() => {
        console.log("Safety timeout triggered - showing login form");
        setShowContent(true);
      }, 1000); // Reducido a 1 segundo para mayor rapidez
      
      return () => clearTimeout(safetyTimer);
    }
  }, [isLoading]);

  // Show loading indicator
  if (!showContent || (isLoading && !redirectAttempted)) {
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
