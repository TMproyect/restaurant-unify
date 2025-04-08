
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyVisibilityWarningProps {
  isVisible: boolean;
}

export const ApiKeyVisibilityWarning: React.FC<ApiKeyVisibilityWarningProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <Alert className="mt-4 border-amber-200 bg-amber-50">
      <AlertDescription className="text-amber-600">
        <strong>¡Importante!</strong> Copia y guarda esta clave ahora. Por seguridad, no se mostrará de nuevo automáticamente.
      </AlertDescription>
    </Alert>
  );
};
