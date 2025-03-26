
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setLocalLoading(false);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 100);
    }
  }, [authLoading]);

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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Login error handled locally:", err);
      if (err.message.includes('Email not confirmed')) {
        toast.error('El correo electrónico no ha sido confirmado', {
          description: 'Por favor, revisa tu bandeja de entrada y confirma tu correo',
        });
      } else if (err.message.includes('Invalid login credentials')) {
        toast.error('Credenciales inválidas', {
          description: 'El correo o la contraseña son incorrectos',
        });
      }
    } finally {
      setTimeout(() => {
        setLocalLoading(false);
        setButtonDisabled(false);
      }, 500);
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
  );
};

export default LoginForm;
