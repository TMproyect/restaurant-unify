
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyStatusAlertProps {
  status: 'success' | 'error' | null;
  message: string | null;
}

export const ApiKeyStatusAlert: React.FC<ApiKeyStatusAlertProps> = ({ status, message }) => {
  if (!status || !message) return null;
  
  return (
    <Alert className={`mt-4 ${
      status === 'success' 
        ? 'border-green-200 bg-green-50' 
        : 'border-red-200 bg-red-50'
      }`}>
      <AlertDescription className={`${
        status === 'success' ? 'text-green-600' : 'text-red-600'
      }`}>
        {message}
      </AlertDescription>
    </Alert>
  );
};
