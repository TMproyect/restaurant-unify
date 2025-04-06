
import React from 'react';
import { AuthUser } from '@/contexts/auth/types';

interface AuthRedirectStateProps {
  user: AuthUser | null;
}

const AuthRedirectState: React.FC<AuthRedirectStateProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-lg mb-2">Sesión iniciada</p>
        <p className="mb-2">Redirigiendo al dashboard...</p>
        <div className="h-2 w-64 bg-gray-200 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-green-500 animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthRedirectState;
