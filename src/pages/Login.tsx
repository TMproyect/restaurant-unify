
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import LoadingState from '@/components/auth/LoadingState';
import AuthRedirectState from '@/components/auth/AuthRedirectState';
import { useLoginEffects } from '@/hooks/use-login-effects';

const Login = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    activeTab, 
    setActiveTab, 
    showContent 
  } = useLoginEffects();

  // Show loading indicator
  if (isLoading || !showContent) {
    console.log("Showing loading state on Login page");
    return <LoadingState />;
  }

  // If user is authenticated, we should not render this page but be redirected
  if (isAuthenticated && user) {
    console.log("User is authenticated on Login page, should be redirected soon...", user);
    return <AuthRedirectState user={user} />;
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
