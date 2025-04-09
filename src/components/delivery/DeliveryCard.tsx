
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeliveryOrder } from "@/services/delivery";
import { Clock, MapPin, Phone } from "lucide-react";

interface DeliveryCardProps {
  delivery: DeliveryOrder;
  onAssignDriver?: (orderId: string) => void;
  onMarkDelivered?: (orderId: string) => void;
}

const DeliveryCard = ({ delivery, onAssignDriver, onMarkDelivered }: DeliveryCardProps) => {
  // Determine the status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'en-route':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format the status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'preparing':
        return 'Preparando';
      case 'en-route':
        return 'En Ruta';
      case 'delivered':
        return 'Entregado';
      default:
        return status;
    }
  };

  return (
    <Card className="hover:bg-secondary/50 cursor-pointer transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="space-y-2">
            <h3 className="font-bold">{delivery.customer_name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin size={14} className="mr-1" />
              <span>{delivery.address?.street}, {delivery.address?.city}</span>
            </div>
            {delivery.phone_number && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone size={14} className="mr-1" />
                <span>{delivery.phone_number}</span>
              </div>
            )}
            {delivery.created_at && (
              <div className="flex items-center text-sm">
                <Clock size={14} className="mr-1 text-muted-foreground" />
                <span>Programado: {new Date(delivery.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            )}
            {delivery.driver_name && (
              <p className="text-sm font-medium">Repartidor: {delivery.driver_name}</p>
            )}
          </div>
          <div className="mt-4 md:mt-0 md:text-right">
            <div className="flex flex-col h-full justify-between items-end">
              <div>
                <p className="font-bold">${delivery.total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{delivery.items_count} items</p>
                {delivery.status === 'delivered' && delivery.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Entregado: {new Date(delivery.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(delivery.status)}`}>
                  {getStatusText(delivery.status)}
                </span>
              </div>
              {delivery.status === 'pending' || delivery.status === 'preparing' ? (
                <Button 
                  className="mt-3" 
                  size="sm"
                  onClick={() => onAssignDriver && delivery.id && onAssignDriver(delivery.id)}
                >
                  Asignar Repartidor
                </Button>
              ) : delivery.status === 'en-route' ? (
                <Button 
                  className="mt-3" 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onMarkDelivered && delivery.id && onMarkDelivered(delivery.id)}
                >
                  Marcar como Entregado
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryCard;
