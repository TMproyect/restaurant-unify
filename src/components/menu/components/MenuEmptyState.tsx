
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info, Plus } from 'lucide-react';

interface MenuEmptyStateProps {
  searchTerm: string;
  filterCategory: string;
  onAddItem: () => void;
}

const MenuEmptyState: React.FC<MenuEmptyStateProps> = ({ 
  searchTerm, 
  filterCategory, 
  onAddItem 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
      <Info className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="font-medium text-lg mb-2">No hay platos disponibles</h3>
      <p className="text-muted-foreground text-center mb-4">
        {searchTerm || filterCategory 
          ? "No se encontraron platos con los filtros aplicados." 
          : "Todavía no hay platos en el menú. Comience añadiendo su primer plato."}
      </p>
      <Button onClick={onAddItem} className="gap-2">
        <Plus className="h-4 w-4" /> Añadir plato
      </Button>
    </div>
  );
};

export default MenuEmptyState;
