
import { DeliveryOrder } from "@/services/delivery";
import { Loader2, Search } from "lucide-react";
import DeliveryCard from "./DeliveryCard";

interface DeliveryListProps {
  deliveries: DeliveryOrder[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  onAssignDriver: (orderId: string) => void;
  onMarkDelivered: (orderId: string) => void;
}

const DeliveryList = ({ 
  deliveries, 
  isLoading, 
  searchQuery, 
  statusFilter,
  onAssignDriver,
  onMarkDelivered
}: DeliveryListProps) => {
  const filteredDeliveries = deliveries.filter(delivery => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = delivery.customer_name.toLowerCase().includes(query);
      const matchesAddress = delivery.address?.street?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesAddress) {
        return false;
      }
    }
    
    // Filter by status tab
    if (statusFilter === 'pending') {
      return delivery.status === 'pending' || delivery.status === 'preparing';
    } else if (statusFilter === 'en-route') {
      return delivery.status === 'en-route';
    } else if (statusFilter === 'delivered') {
      return delivery.status === 'delivered';
    }
    
    return true; // 'all' tab
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredDeliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-1">No se encontraron entregas</h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `No hay resultados para "${searchQuery}"`
            : `No hay entregas ${
                statusFilter === 'pending' ? 'pendientes' : 
                statusFilter === 'en-route' ? 'en ruta' : 
                statusFilter === 'delivered' ? 'entregadas' : ''
              }`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredDeliveries.map(delivery => (
        <DeliveryCard 
          key={delivery.id}
          delivery={delivery}
          onAssignDriver={onAssignDriver}
          onMarkDelivered={onMarkDelivered}
        />
      ))}
    </div>
  );
};

export default DeliveryList;
