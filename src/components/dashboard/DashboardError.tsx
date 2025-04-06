
import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardErrorProps {
  error: string;
}

const DashboardError: React.FC<DashboardErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  console.log('🔄 [DashboardError] Rendering error state:', error);
  
  // If error contains timeout, provide specific message
  const isTimeoutError = error.toLowerCase().includes('tiempo') || error.toLowerCase().includes('timeout');
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center p-8 bg-red-50 rounded-lg max-w-lg">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        
        <div className="bg-white p-4 rounded-md mb-6 text-left">
          <h3 className="font-medium mb-2 text-gray-800">Posibles soluciones:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-red-100 rounded-full mr-2 mt-0.5"></span>
              Recargar la página para reiniciar la aplicación
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-amber-100 rounded-full mr-2 mt-0.5"></span>
              Verificar su conexión a internet
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-blue-100 rounded-full mr-2 mt-0.5"></span>
              Cerrar sesión y volver a iniciar sesión
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-0.5"></span>
              Limpiar la caché del navegador
            </li>
          </ul>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            variant="default"
            onClick={() => window.location.reload()}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar página
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir a inicio
          </Button>
          
          {isTimeoutError && (
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardError;
