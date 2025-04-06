
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  timeout?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Cargando...",
  subMessage = "Conectando con el servidor...",
  timeout = 10000
}) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Show timeout warning after specified time
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("LoadingState timeout reached, showing timeout message");
      setShowTimeout(true);
    }, timeout);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, timeout / 100);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
    };
  }, [timeout]);
  
  // Log for debugging purposes
  useEffect(() => {
    console.log("LoadingState component mounted");
    return () => console.log("LoadingState component unmounted");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="animate-spin h-8 w-8 mr-2" />
          <p className="text-xl font-medium">{message}</p>
        </div>
        
        <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500 mt-2">{subMessage}</p>
        
        {showTimeout && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <p className="font-medium">La carga está tomando más tiempo de lo esperado</p>
            <p className="text-sm mt-1">
              Esto puede ocurrir por problemas de conexión o servicios temporalmente no disponibles.
              Por favor asegúrese de tener una conexión estable a Internet.
            </p>
            <p className="text-xs mt-2 text-amber-700">
              Estado: Esperando respuesta del servidor...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
