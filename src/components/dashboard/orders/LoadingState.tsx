
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  console.log('🔄 [LoadingState] Rendering loading state');
  
  return (
    <div className="flex justify-center py-10">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Cargando órdenes...</p>
      </div>
    </div>
  );
};

export default LoadingState;
