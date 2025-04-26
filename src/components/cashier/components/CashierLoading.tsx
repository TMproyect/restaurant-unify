
import React from 'react';
import { Loader2 } from 'lucide-react';

export const CashierLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-lg font-medium">Cargando módulo de caja...</p>
    </div>
  );
};
