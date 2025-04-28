
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MenuActionsProps {
  onAddItem: () => void;
}

const MenuActions: React.FC<MenuActionsProps> = ({ onAddItem }) => {
  return (
    <div className="flex gap-2 w-full lg:w-auto">
      <Button 
        onClick={onAddItem} 
        className="gap-2"
      >
        <Plus className="h-4 w-4" /> Añadir plato
      </Button>
    </div>
  );
};

export default MenuActions;
