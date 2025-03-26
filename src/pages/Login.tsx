import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, login, signup, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [localLoading, setLocalLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    // Reset local loading state when auth loading state changes
    if (!isLoading) {
      setLocalLoading(false);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 100);
    }
  }, [isLoading]);

  // Auto-reset button state after timeout to prevent permanent disabled state
  useEffect(() => {
    let timer: number | undefined;
    
    if (buttonDisabled || localLoading) {
      timer = window.setTimeout(() => {
        console.log("Auto-resetting button state");
        setButtonDisabled(false);
        setLocalLoading(false);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [buttonDisabled, localLoading]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localLoading || buttonDisabled) {
      console.log("Button click prevented: already loading");
      return;
    }
    
    setLocalLoading(true);
    setButtonDisabled(true);
    
    console.log("Login button clicked, state set to loading");
    
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login error handled locally:", err);
    } finally {
      setTimeout(() => {
        setLocalLoading(false);
        setButtonDisabled(false);
      }, 500);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localLoading || buttonDisabled) {
      console.log("Button click prevented: already loading");
      return;
    }
    
    setLocalLoading(true);
    setButtonDisabled(true);
    
    console.log("Signup button clicked, state set to loading");
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      setTimeout(() => {
        setLocalLoading(false);
        setButtonDisabled(false);
      }, 500);
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      setTimeout(() => {
        setLocalLoading(false);
        setButtonDisabled(false);
      }, 500);
      return;
    }
    
    try {
      // Always use 'admin' as the default role for new users
      await signup(email, password, name, 'admin');
      console.log("Signup successful, user should now be automatically logged in");
      // Don't switch to login tab if signup was successful - the user will be automatically logged in
    } catch (err) {
      console.error("Signup error handled locally:", err);
      // Reset form only on error
      setPassword('');
      setConfirmPassword('');
    } finally {
      setTimeout(() => {
        setLocalLoading(false);
        setButtonDisabled(false);
      }, 500);
    }
  };

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
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@restaurante.com"
                      required
                      disabled={localLoading || buttonDisabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={localLoading || buttonDisabled}
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col">
                  <Button 
                    type="submit" 
                    className="w-full mb-4" 
                    disabled={localLoading || buttonDisabled}
                  >
                    {localLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Pérez"
                      required
                      disabled={localLoading || buttonDisabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Correo Electrónico</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@restaurante.com"
                      required
                      disabled={localLoading || buttonDisabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={localLoading || buttonDisabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar contraseña"
                      required
                      disabled={localLoading || buttonDisabled}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={localLoading || buttonDisabled}
                  >
                    {localLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      'Registrarse'
                    )}
                  </Button>
                </CardFooter>
              </form>
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
