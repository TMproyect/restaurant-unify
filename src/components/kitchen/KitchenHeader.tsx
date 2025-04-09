
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, Clock } from 'lucide-react';

interface KitchenHeaderProps {
  selectedKitchen: string;
  setSelectedKitchen: (kitchen: string) => void;
  kitchenOptions: { id: string; name: string; }[];
  stats: { 
    pendingItems: number; 
    preparingItems: number; 
    completedItems: number;
    totalItems: number;
  };
  loading: boolean;
  handleRefresh: () => void;
  getAverageTime: () => string;
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
    <header>
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={selectedKitchen} onValueChange={setSelectedKitchen}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar cocina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Cocinas</SelectItem>
              {kitchenOptions.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RotateCw className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>
          
          <div className="bg-muted px-3 py-1 rounded-md flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tiempo prom: {getAverageTime()} min</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard 
          title="Pendientes" 
          value={stats.pendingItems}
          className="border-l-4 border-l-yellow-500" 
        />
        <StatCard 
          title="En preparación" 
          value={stats.preparingItems}
          className="border-l-4 border-l-blue-500" 
        />
        <StatCard 
          title="Completados" 
          value={stats.completedItems}
          className="border-l-4 border-l-green-500" 
        />
        <StatCard 
          title="Total" 
          value={stats.totalItems}
          className="border-l-4 border-l-gray-500" 
        />
      </div>
    </header>
  );
};

const StatCard = ({ 
  title, 
  value, 
  className = "" 
}: { 
  title: string; 
  value: number;
  className?: string;
}) => (
  <Card className={`${className}`}>
    <CardContent className="p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </CardContent>
  </Card>
);

export default KitchenHeader;
