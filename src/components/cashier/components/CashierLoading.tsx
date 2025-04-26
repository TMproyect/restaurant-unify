
import React from 'react';
import { CircleDollarSign } from 'lucide-react';

export const CashierLoading = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <CircleDollarSign className="mx-auto h-12 w-12 text-primary animate-pulse mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Caja</h2>
        <p className="text-muted-foreground">Inicializando...</p>
      </div>
    </div>
  );
};
