
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
  const [retryCount, setRetryCount] = useState(0);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    let timer: number | null = null;
    
    if (loading) {
      // Auto-reset loading after 8 seconds as a failsafe
      timer = window.setTimeout(() => {
        console.log("Safety timeout triggered to reset loading state");
        setLoading(false);
      }, 8000);
    }
    
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [loading]);

  // Check network connectivity
  const checkNetworkConnectivity = () => {
    return navigator.onLine;
  };

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

    // Check network connectivity first
    if (!checkNetworkConnectivity()) {
      toast.error('Error de conexión', {
        description: 'Verifique su conexión a internet e intente nuevamente',
      });
      return;
    }
    
    try {
      console.log("Iniciando proceso de login para:", email);
      setLoading(true);
      
      console.log("Enviando solicitud de login a supabase...");
      const result = await login(email, password);
      console.log("Login completado exitosamente:", result);
      
      toast.success('Inicio de sesión exitoso', {
        description: 'Redirigiendo al dashboard...',
      });
      
      if (onSuccess) {
        console.log("Ejecutando callback de éxito para redirección");
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error en login:", err);
      let errorMessage = 'Intente nuevamente más tarde';
      
      if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, revisa tu bandeja de entrada y confirma tu correo';
      } else if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'El correo o la contraseña son incorrectos';
      } else if (err.message?.includes('Failed to fetch') || err.status === 0) {
        errorMessage = 'Error de conexión con el servidor. Compruebe su conexión a internet.';
        
        // Auto-retry once for network errors
        if (retryCount < 1) {
          setRetryCount(prevCount => prevCount + 1);
          setTimeout(() => {
            console.log("Reintentando login automáticamente");
            setLoading(false);
            handleLogin(e);
          }, 1500);
          return;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error('Error al iniciar sesión', {
        description: errorMessage,
      });
    } finally {
      console.log("Proceso de login finalizado, reseteando estado de carga");
      setLoading(false);
      setRetryCount(0);
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
