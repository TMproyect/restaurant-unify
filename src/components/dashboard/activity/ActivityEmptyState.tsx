
import React from 'react';
import { FileSearch } from 'lucide-react';
import { EmptyStateProps } from './types';

const ActivityEmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  let message = 'No hay órdenes disponibles para mostrar';
  
  if (filter) {
    message = `No se encontraron órdenes con el filtro "${filter}"`;
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 rounded-full bg-muted">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Las órdenes aparecerán aquí una vez que se creen y cumplan con los criterios de filtrado seleccionados.
      </p>
    </div>
  );
};

export default ActivityEmptyState;
