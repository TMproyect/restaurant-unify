
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityTabsProps {
  itemsCount: Record<string, number>;
}

const ActivityTabs: React.FC<ActivityTabsProps> = ({ itemsCount }) => {
  return (
    <TabsList className="w-full grid grid-cols-4">
      <TabsTrigger value="all" className="relative">
        Todos
        {itemsCount.all > 0 && (
          <span className="ml-1 text-xs bg-gray-200 text-gray-800 rounded-full px-1.5">
            {itemsCount.all}
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger value="active" className="relative">
        Activos
        {itemsCount.active > 0 && (
          <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-1.5">
            {itemsCount.active}
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger value="completed" className="relative">
        Completados
        {itemsCount.completed > 0 && (
          <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-1.5">
            {itemsCount.completed}
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger value="exceptions" className="relative">
        Excepciones
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="absolute right-1">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[250px] text-xs">
                Muestra órdenes que:
                <br />- Están retrasadas (más de 15 minutos)
                <br />- Han sido canceladas
                <br />- Tienen descuentos significativos (≥15%)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {itemsCount.exceptions > 0 && (
          <span className="ml-1 text-xs bg-amber-100 text-amber-800 rounded-full px-1.5">
            {itemsCount.exceptions}
          </span>
        )}
      </TabsTrigger>
    </TabsList>
  );
};

export default ActivityTabs;
