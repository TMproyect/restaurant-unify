
import React from 'react';
import { AlertCircle } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <h1 className="text-2xl font-bold text-center">Acceso no permitido</h1>
      <p className="text-muted-foreground text-center">
        No tienes permisos para ver la pantalla de cocina.
      </p>
    </div>
  );
};

export default AccessDenied;
