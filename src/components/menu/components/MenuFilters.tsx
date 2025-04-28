
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MenuCategory } from '@/services/menu/categoryService';

interface MenuFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  handleSearch: () => void;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  categories: MenuCategory[];
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  onCategoryChange,
  handleSearch,
  handleSearchKeyDown,
  categories
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar platos..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={filterCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={handleSearch} size="icon" className="flex-shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MenuFilters;
