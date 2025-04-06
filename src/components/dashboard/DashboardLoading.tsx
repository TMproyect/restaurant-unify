
import React from 'react';

const DashboardLoading: React.FC = () => {
  console.log('🔄 [DashboardLoading] Rendering loading state');
  
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardLoading;
