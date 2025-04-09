
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { FilterDropdownProps } from './types';

const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
  activeFilter, 
  setActiveFilter, 
  filters 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="h-4 w-4 mr-1" /> Filtrar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setActiveFilter(null)}>
          Mostrar Todo
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {filters.map(filter => (
          <DropdownMenuItem
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={activeFilter === filter.id ? "bg-muted" : ""}
          >
            {filter.icon} {filter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
