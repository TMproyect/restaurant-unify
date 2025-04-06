
import React from 'react';

interface DashboardErrorProps {
  error: string;
}

const DashboardError: React.FC<DashboardErrorProps> = ({ error }) => {
  console.log('🔄 [DashboardError] Rendering error state:', error);
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => {
            console.log('🔄 [DashboardError] Reload button clicked');
            window.location.reload();
          }}
        >
          Recargar página
        </button>
      </div>
    </div>
  );
};

export default DashboardError;
