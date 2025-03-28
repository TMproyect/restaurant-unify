
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check network connectivity
  const checkNetworkConnectivity = () => {
    return navigator.onLine;
  };

  // Logs para verificar el estado al montar el componente
  useEffect(() => {
    console.log("LoginForm: Componente montado");
    
    // Verificar la conexión a supabase al inicio
    const testConnection = async () => {
      try {
        const { data, error } = await fetch('https://imcxvnivqrckgjrimzck.supabase.co/auth/v1/health')
          .then(res => res.json());
        console.log("LoginForm: Conexión a Supabase health check:", { data, error, status: "ok" });
      } catch (err) {
        console.error("LoginForm: Error verificando conexión a Supabase:", err);
      }
    };
    
    testConnection();
    
    return () => {
      console.log("LoginForm: Componente desmontado");
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("LoginForm: handleLogin iniciado, estado actual:", {
      email,
      passwordLength: password ? password.length : 0,
      loading,
      retryCount
    });
    
    if (loading) {
      console.log("LoginForm: Proceso de login ya en curso, ignorando solicitud");
      return;
    }
    
    if (!email || !password) {
      console.log("LoginForm: Datos incompletos, mostrando error");
      toast.error('Datos requeridos', {
        description: 'Por favor ingrese su correo y contraseña',
      });
      return;
    }

    // Check network connectivity first
    if (!checkNetworkConnectivity()) {
      console.log("LoginForm: Sin conexión a internet");
      toast.error('Error de conexión', {
        description: 'Verifique su conexión a internet e intente nuevamente',
      });
      return;
    }
    
    try {
      console.log(`LoginForm: Iniciando proceso de login para: ${email} (intento #${retryCount + 1})`);
      setLoading(true);
      
      console.log("LoginForm: Enviando solicitud de login a supabase...");
      const result = await login(email, password);
      
      console.log("LoginForm: Resultado de login:", {
        success: !!result?.user,
        error: result?.error ? (result.error.message || 'Error desconocido') : null,
        userId: result?.user?.id
      });
      
      if (result?.user) {
        console.log("LoginForm: Login completado exitosamente con ID:", result.user.id);
        
        toast.success('Inicio de sesión exitoso', {
          description: 'Redirigiendo al dashboard...',
        });
        
        // No redirection here - Login.tsx will handle this
      } else if (result?.error) {
        console.error("LoginForm: Error explícito en login:", result.error);
        throw new Error(result.error.message || 'Error durante el inicio de sesión');
      } else {
        console.error("LoginForm: No se recibieron datos de usuario después del login");
        throw new Error('No se recibieron datos de usuario después del login');
      }
    } catch (err: any) {
      console.error("LoginForm: Error en login:", err);
      console.error("LoginForm: Error stack:", err.stack);
      
      let errorMessage = 'Intente nuevamente más tarde';
      
      if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, revisa tu bandeja de entrada y confirma tu correo';
      } else if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'El correo o la contraseña son incorrectos';
      } else if (err.message?.includes('Failed to fetch') || err.status === 0 || !checkNetworkConnectivity()) {
        errorMessage = 'Error de conexión con el servidor. Compruebe su conexión a internet.';
        
        // Auto-retry once for network errors
        if (retryCount < 1) {
          console.log("LoginForm: Configurando reintento automático");
          setRetryCount(prevCount => prevCount + 1);
          setTimeout(() => {
            console.log("LoginForm: Reintentando login automáticamente");
            setLoading(false);
            handleLogin(e);
          }, 1500);
          return;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log("LoginForm: Mostrando error:", errorMessage);
      toast.error('Error al iniciar sesión', {
        description: errorMessage,
      });
    } finally {
      console.log("LoginForm: Proceso de login finalizado, reseteando estado de carga");
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
