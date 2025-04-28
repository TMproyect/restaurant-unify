
import React from 'react';
import { MoreHorizontal, Archive, RotateCcw } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

interface OrderActionMenuProps {
  orderId: string;
  status: string;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  isArchived?: boolean;
}

const OrderActionMenu: React.FC<OrderActionMenuProps> = ({ 
  orderId, 
  status,
  onStatusChange,
  isArchived = false
}) => {
  console.log(`🔄 [OrderActionMenu] Rendering for order ${orderId} with status ${status}`);
  const { toast } = useToast();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isArchived ? (
          // Acciones para órdenes archivadas
          <DropdownMenuItem onClick={() => onStatusChange(orderId, 'pending')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar orden
          </DropdownMenuItem>
        ) : (
          // Acciones para órdenes no archivadas
          <>
            {status === 'pending' && (
              <DropdownMenuItem onClick={() => onStatusChange(orderId, 'preparing')}>
                Iniciar preparación
              </DropdownMenuItem>
            )}
            {status === 'preparing' && (
              <DropdownMenuItem onClick={() => onStatusChange(orderId, 'ready')}>
                Marcar como listo
              </DropdownMenuItem>
            )}
            {status === 'ready' && (
              <DropdownMenuItem onClick={() => onStatusChange(orderId, 'delivered')}>
                Marcar como entregado
              </DropdownMenuItem>
            )}
            {(status === 'pending' || status === 'preparing') && (
              <DropdownMenuItem onClick={() => onStatusChange(orderId, 'cancelled')}>
                Cancelar pedido
              </DropdownMenuItem>
            )}
            {(status === 'delivered' || status === 'cancelled') && (
              <DropdownMenuItem onClick={() => onStatusChange(orderId, 'archived')}>
                <Archive className="mr-2 h-4 w-4" />
                Archivar orden
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem onClick={() => {
          console.log('View order details for:', orderId);
          toast({
            title: "Ver detalles",
            description: `Detalles de la orden #${orderId?.substring(0, 4)}`
          });
        }}>
          Ver detalles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActionMenu;
