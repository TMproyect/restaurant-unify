
import React from 'react';
import { FileText } from 'lucide-react';
import { EmptyStateProps } from './types';

const ActivityEmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No hay datos que mostrar con los filtros actuales' 
}) => {
  return (
    <div className="text-center py-8 text-gray-500">
      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
      <p>{message}</p>
    </div>
  );
};

export default ActivityEmptyState;
