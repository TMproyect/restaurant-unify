
import React from 'react';
import { Search } from 'lucide-react';

interface EmptyOrdersStateProps {
  searchQuery?: string;
  filter?: string;
}

const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({ searchQuery, filter }) => {
  console.log('🔄 [EmptyOrdersState] Rendering empty state. Search:', searchQuery, 'Filter:', filter);
  
  return (
    <tr>
      <td colSpan={7} className="text-center py-10 text-muted-foreground">
        {searchQuery ? (
          <div className="flex flex-col items-center">
            <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p>No se encontraron órdenes para <strong>"{searchQuery}"</strong></p>
            <p className="text-sm mt-1">Intenta con otra búsqueda</p>
          </div>
        ) : (
          <div>
            <p>No hay órdenes para mostrar.</p>
            {filter !== 'all' && (
              <p className="text-sm mt-1">No hay órdenes con estado "{filter}"</p>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default EmptyOrdersState;
