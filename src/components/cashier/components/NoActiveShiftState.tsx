
import React, { useEffect, useState } from 'react';
import { CircleDollarSign } from 'lucide-react';
import OpenShiftForm from '../OpenShiftForm';
import { useCashRegister } from '@/hooks/use-cash-register';

export const NoActiveShiftState = () => {
  const { isLoading } = useCashRegister();
  const [renderCount, setRenderCount] = useState(0);
  
  // Help debug rendering issues
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log("[NoActiveShiftState] Rendered, loading state:", isLoading, "Render count:", renderCount + 1);
  }, [isLoading]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <CircleDollarSign size={24} className="text-primary" />
        <h1 className="text-2xl font-bold">Punto de Venta / Caja</h1>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <h2 className="text-lg font-medium text-amber-800 mb-2">Apertura de Caja Requerida</h2>
        <p className="text-amber-700 mb-3">
          Para acceder a la funcionalidad completa del Punto de Venta, es necesario iniciar un turno de caja.
          Por favor ingresa el monto inicial con el que comienzas tu turno.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-muted-foreground">Cargando información del turno...</p>
        </div>
      ) : (
        <OpenShiftForm />
      )}
      
      <div className="text-xs text-muted-foreground text-right mt-4">
        Estado de carga: {isLoading ? 'Cargando' : 'Completado'}
      </div>
    </div>
  );
};
