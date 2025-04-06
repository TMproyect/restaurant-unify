
import React, { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { AuthUser } from '@/contexts/auth/types';

interface AuthRedirectStateProps {
  user: AuthUser | null;
}

const AuthRedirectState: React.FC<AuthRedirectStateProps> = ({ user }) => {
  const [showDelay, setShowDelay] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  
  // Show delay message after 3 seconds
  useEffect(() => {
    const delayId = setTimeout(() => {
      console.log("AuthRedirectState delay timeout reached, showing delay message");
      setShowDelay(true);
    }, 3000);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setRedirectProgress(prev => {
        const newProgress = prev + 2;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);
    
    return () => {
      clearTimeout(delayId);
      clearInterval(progressInterval);
    };
  }, []);
  
  // Log for debugging purposes
  useEffect(() => {
    console.log("AuthRedirectState component mounted", { 
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : 'No user' 
    });
    return () => console.log("AuthRedirectState component unmounted");
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-xl font-medium">Sesión iniciada</p>
        </div>
        
        <p className="mb-2">
          {user?.name ? `Bienvenido/a, ${user.name}` : 'Redirigiendo al dashboard...'}
        </p>
        
        <div className="relative h-2 w-full bg-gray-200 mx-auto rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${redirectProgress}%` }}
          />
        </div>
        
        <p className="text-sm flex items-center justify-center text-gray-600">
          <ArrowRight className="h-4 w-4 mr-1" />
          Accediendo a tu dashboard
        </p>
        
        {showDelay && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <p className="font-medium">Verificando permisos de usuario</p>
            <p className="text-sm mt-1">
              Estamos preparando tu experiencia personalizada. La redirección debería completarse en unos momentos.
            </p>
            <p className="text-xs mt-2 text-blue-700">
              Rol de usuario: {user?.role || 'Verificando...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthRedirectState;
