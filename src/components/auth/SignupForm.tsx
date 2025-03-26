
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
  const { signup, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Reset local loading when auth loading changes
  useEffect(() => {
    if (!authLoading) {
      setLocalLoading(false);
    }
  }, [authLoading]);

  // Auto-reset button state after timeout to prevent permanent disabled state
  useEffect(() => {
    let timer: number | undefined;
    
    if (localLoading) {
      timer = window.setTimeout(() => {
        console.log("Auto-resetting loading state after timeout");
        setLocalLoading(false);
      }, 10000); // 10 second safety timeout
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [localLoading]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localLoading || authLoading) {
      console.log("Signup already in progress, ignoring request");
      return;
    }
    
    setLocalLoading(true);
    console.log("Signup button clicked, state set to loading");
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      setLocalLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      setLocalLoading(false);
      return;
    }
    
    try {
      // Always use 'admin' as the default role for new users
      await signup(email, password, name, 'admin');
      console.log("Signup successful, user should now be automatically logged in");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Signup error handled locally:", err);
      // Reset form only on error
      if (err.message.includes('rate limit')) {
        toast.error('Por motivos de seguridad, debe esperar 32 segundos antes de intentarlo nuevamente');
      } else if (err.message.includes('User already registered')) {
        toast.error('El usuario ya está registrado', {
          description: 'Intenta iniciar sesión o utiliza otro correo electrónico',
        });
      }
      setPassword('');
      setConfirmPassword('');
    } finally {
      console.log("Signup process completed, resetting loading state");
      setLocalLoading(false);
    }
  };

  const isButtonDisabled = localLoading || authLoading;

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
            disabled={isButtonDisabled}
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
            disabled={isButtonDisabled}
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
            disabled={isButtonDisabled}
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
            disabled={isButtonDisabled}
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isButtonDisabled}
        >
          {isButtonDisabled ? (
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
