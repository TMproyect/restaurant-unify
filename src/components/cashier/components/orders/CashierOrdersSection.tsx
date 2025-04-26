
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CashierOrdersList from '../../CashierOrdersList';

interface CashierOrdersSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: 'ready' | 'delivered';
  onFilterChange: (value: 'ready' | 'delivered') => void;
  onSelectOrder: (orderId: string) => void;
  selectedOrderId: string | null;
}

const CashierOrdersSection: React.FC<CashierOrdersSectionProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onSelectOrder,
  selectedOrderId,
}) => {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Órdenes Pendientes</h2>
        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por mesa, cliente o código..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <Tabs defaultValue="ready" onValueChange={(value) => onFilterChange(value as 'ready' | 'delivered')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ready">Listos para Cobrar</TabsTrigger>
            <TabsTrigger value="delivered">Pagadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <CashierOrdersList 
        filter={filter}
        searchQuery={searchQuery}
        onSelectOrder={onSelectOrder}
        selectedOrderId={selectedOrderId}
      />
    </>
  );
};

export default CashierOrdersSection;
