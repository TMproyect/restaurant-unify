
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, CheckCircle, XCircle, Zap } from 'lucide-react';
import { NormalizedOrderStatus } from '@/utils/orderStatusUtils';

interface OrderStatusActionsProps {
  orderStatus: NormalizedOrderStatus;
  onAction: (newStatus: NormalizedOrderStatus) => Promise<boolean>;
  isPrioritized?: boolean;
}

const OrderStatusActions: React.FC<OrderStatusActionsProps> = ({
  orderStatus,
  onAction,
  isPrioritized = false
}) => {
  return (
    <div className="flex gap-2 justify-end mt-4 pt-2 border-t">
      {orderStatus === 'pending' && (
        <Button 
          variant={isPrioritized ? "default" : "warning"}
          onClick={() => onAction('preparing')}
          className={`flex items-center gap-1 ${
            isPrioritized ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
          }`}
        >
          {isPrioritized ? <Zap size={18} /> : <ChefHat size={18} />}
          <span>Iniciar Preparación</span>
        </Button>
      )}
      
      {orderStatus === 'preparing' && (
        <Button 
          variant="success" 
          onClick={() => onAction('ready')}
          className="flex items-center gap-1"
        >
          <CheckCircle size={18} />
          <span>Marcar como Listo</span>
        </Button>
      )}
      
      <Button 
        variant="destructive" 
        onClick={() => onAction('cancelled')}
        className="flex items-center gap-1"
      >
        <XCircle size={18} />
        <span>Cancelar Pedido</span>
      </Button>
    </div>
  );
};

export default OrderStatusActions;
