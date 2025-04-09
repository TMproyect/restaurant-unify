
import { useState, useEffect } from 'react';
import { DeliveryOrder, getDeliveryOrders, assignDeliveryDriver, markDeliveryCompleted } from '@/services/delivery';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useDeliveryData = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadDeliveryOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getDeliveryOrders();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading delivery orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos de entrega",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: string) => {
    if (!user) return;
    
    try {
      const success = await assignDeliveryDriver(
        orderId,
        user.id,
        user.name
      );
      
      if (success) {
        toast({
          title: "Repartidor asignado",
          description: "Se te ha asignado este pedido"
        });
        loadDeliveryOrders();
      } else {
        toast({
          title: "Error",
          description: "No se pudo asignar el repartidor",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al asignar el repartidor",
        variant: "destructive"
      });
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const success = await markDeliveryCompleted(orderId);
      
      if (success) {
        toast({
          title: "Entrega completada",
          description: "El pedido ha sido marcado como entregado"
        });
        loadDeliveryOrders();
      } else {
        toast({
          title: "Error",
          description: "No se pudo marcar el pedido como entregado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error marking delivery as completed:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al marcar la entrega como completada",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadDeliveryOrders();
  }, []);

  return {
    deliveries,
    isLoading,
    loadDeliveryOrders,
    handleAssignDriver,
    handleMarkDelivered
  };
};
