
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MenuPaginationProps {
  page: number;
  hasMore: boolean;
  totalItems: number;
  itemsPerPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const MenuPagination: React.FC<MenuPaginationProps> = ({
  page,
  hasMore,
  totalItems,
  itemsPerPage,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="flex justify-between items-center pt-4 pb-2">
      <p className="text-sm text-muted-foreground">
        Mostrando {itemsPerPage} de {totalItems} elementos
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPrevPage} 
          disabled={page <= 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNextPage} 
          disabled={!hasMore}
          className="gap-1"
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MenuPagination;
