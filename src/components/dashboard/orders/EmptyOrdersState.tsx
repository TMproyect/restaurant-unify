
import React from 'react';
import { Archive, Search } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

interface EmptyOrdersStateProps {
  searchQuery?: string;
  filter?: string;
  isArchived?: boolean;
}

const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({ 
  searchQuery = '',
  filter = 'all',
  isArchived = false
}) => {
  const { hasPermission } = usePermissions();
  const canViewArchived = hasPermission('orders.view_archived');
  
  const getEmptyMessage = () => {
    if (searchQuery) {
      return `No se encontraron órdenes que coincidan con "${searchQuery}"`;
    }
    
    if (isArchived && canViewArchived) {
      return "No hay órdenes archivadas actualmente";
    }
    
    if (filter !== 'all') {
      return `No hay órdenes con estado "${filter}"`;
    }
    
    return "No hay órdenes para mostrar";
  };

  return (
    <tr>
      <td colSpan={7} className="px-3 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          {isArchived && canViewArchived ? (
            <Archive className="h-12 w-12 text-muted-foreground/30 mb-4" />
          ) : (
            <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          )}
          <h3 className="text-lg font-medium mb-1">No hay órdenes disponibles</h3>
          <p className="text-muted-foreground">{getEmptyMessage()}</p>
        </div>
      </td>
    </tr>
  );
};

export default EmptyOrdersState;
