
import React, { useState, useEffect } from 'react';

const DashboardLoading: React.FC = () => {
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    console.log('🔄 [DashboardLoading] Component mounted');
    
    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      console.log('🔄 [DashboardLoading] Component unmounted');
      clearInterval(interval);
    };
  }, []);
  
  console.log('🔄 [DashboardLoading] Rendering loading state', { loadingTime });
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center max-w-md w-full">
        <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        <p className="text-muted-foreground">Cargando dashboard...</p>
        
        {loadingTime > 3 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <p className="font-medium">La carga está tomando más tiempo de lo esperado</p>
            <p className="text-sm mt-1">
              Esto puede ocurrir por problemas de conexión o servicios temporalmente no disponibles.
            </p>
            <button
              className="mt-2 px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          Si continúa viendo esta pantalla, intente refrescar la página
        </p>
      </div>
    </div>
  );
};

export default DashboardLoading;
