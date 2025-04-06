
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-lg mb-2">Cargando...</p>
        <div className="h-2 w-64 bg-gray-200 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Conectando con el servidor...</p>
      </div>
    </div>
  );
};

export default LoadingState;
