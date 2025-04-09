
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, RefreshCw, ChefHat } from 'lucide-react';

interface KitchenHeaderProps {
  selectedKitchen: string;
  setSelectedKitchen: (value: string) => void;
  kitchenOptions: { id: string; name: string }[];
  stats: { 
    pendingItems: number; 
    preparingItems: number; 
    completedItems: number;
    totalItems: number;
  };
  loading: boolean;
  handleRefresh: () => void;
  getAverageTime: () => number;
}

const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  selectedKitchen,
  setSelectedKitchen,
  kitchenOptions,
  stats,
  loading,
  handleRefresh,
  getAverageTime
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-2xl font-bold">Cocina</h1>
      
      <div className="w-full md:w-72">
        <Select value={selectedKitchen} onValueChange={setSelectedKitchen}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar área de cocina" />
          </SelectTrigger>
          <SelectContent>
            {kitchenOptions.map(kitchen => (
              <SelectItem key={kitchen.id} value={kitchen.id}>
                {kitchen.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button variant="outline" className="gap-2">
          <Clock size={16} />
          Tiempo prom: {getAverageTime()} min
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-2">
              <ChefHat size={16} />
              Estadísticas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem className="flex justify-between">
              Pendientes <span className="font-bold ml-2">{stats.pendingItems}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between">
              En preparación <span className="font-bold ml-2">{stats.preparingItems}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between">
              Completados <span className="font-bold ml-2">{stats.completedItems}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between border-t border-border mt-1 pt-1">
              Total <span className="font-bold ml-2">{stats.totalItems}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default KitchenHeader;
