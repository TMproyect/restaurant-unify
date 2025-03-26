
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Safety timeout to prevent infinite loading
  useEffect(() => {
    let timer: number | null = null;
    
    if (loading) {
      // Auto-reset loading after 1 second as a failsafe
      timer = window.setTimeout(() => {
        console.log("Safety timeout triggered in SignupForm to reset loading state");
        setLoading(false);
      }, 1000);
    }
    
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [loading]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      console.log("Registro ya en proceso, ignorando solicitud");
      return;
    }
    
    console.log("Iniciando proceso de registro");
    setLoading(true);
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    
    try {
      // Always use 'admin' as the default role for new users
      console.log("Llamando a la función signup con:", { email, name, role: 'admin' });
      await signup(email, password, name, 'admin');
      
      console.log("Registro exitoso");
      toast.success('Cuenta creada con éxito', {
        description: 'Por favor, verifica tu correo electrónico para confirmar tu cuenta',
      });
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error en registro:", err);
      
      // Reset form only on error
      if (err.message?.includes('rate limit')) {
        toast.error('Por motivos de seguridad, debe esperar 32 segundos antes de intentarlo nuevamente');
      } else if (err.message?.includes('User already registered')) {
        toast.error('El usuario ya está registrado', {
          description: 'Intenta iniciar sesión o utiliza otro correo electrónico',
        });
      } else {
        toast.error('Error al crear la cuenta', {
          description: err.message || 'Intente nuevamente más tarde',
        });
      }
      
      setPassword('');
      setConfirmPassword('');
    } finally {
      console.log("Proceso de registro completado, reseteando estado de carga");
      setLoading(false);
    }
  };

  return (
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
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
  );
};

export default SignupForm;
