
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Safety timeout to prevent infinite loading - reducido a 1 segundo
  useEffect(() => {
    let timer: number | null = null;
    
    if (loading) {
      // Auto-reset loading after 1 second as a failsafe
      timer = window.setTimeout(() => {
        console.log("Safety timeout triggered to reset loading state");
        setLoading(false);
      }, 1000); // Reducido a 1 segundo para mayor rapidez
    }
    
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      console.log("Proceso de login ya en curso, ignorando solicitud");
      return;
    }
    
    if (!email || !password) {
      toast.error('Datos requeridos', {
        description: 'Por favor ingrese su correo y contraseña',
      });
      return;
    }
    
    try {
      console.log("Iniciando proceso de login");
      setLoading(true);
      
      await login(email, password);
      console.log("Login completado exitosamente");
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error en login:", err);
      let errorMessage = 'Intente nuevamente más tarde';
      
      if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, revisa tu bandeja de entrada y confirma tu correo';
      } else if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'El correo o la contraseña son incorrectos';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error('Error al iniciar sesión', {
        description: errorMessage,
      });
    } finally {
      console.log("Proceso de login finalizado, reseteando estado de carga");
      setLoading(false);
    }
  };

  return (
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <Button 
          type="submit" 
          className="w-full mb-4" 
          disabled={loading}
        >
          {loading ? (
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
  );
};

export default LoginForm;
