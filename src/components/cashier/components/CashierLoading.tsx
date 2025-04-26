
import React, { useState, useEffect } from 'react';
import { CircleDollarSign } from 'lucide-react';

export const CashierLoading = () => {
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setLoadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <CircleDollarSign className="mx-auto h-12 w-12 text-primary animate-pulse mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Cargando Caja</h2>
        <p className="text-muted-foreground">Verificando estado del turno... ({loadingTime}s)</p>
        {loadingTime > 4 && (
          <p className="text-amber-500 text-sm mt-2">
            El proceso está tomando más tiempo de lo esperado. 
            {loadingTime > 10 && "Puede que haya un problema de conexión."}
          </p>
        )}
      </div>
    </div>
  );
};
