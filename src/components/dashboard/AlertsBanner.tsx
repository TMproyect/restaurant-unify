
import React from 'react';
import { cn } from '@/lib/utils';

// Define alert types
type AlertType = 'warning' | 'error' | 'info';

// Define alert interface
interface Alert {
  id: string;
  type: AlertType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Sample alerts
const SAMPLE_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'warning',
    message: 'Inventario bajo: Tomates (2kg restantes)',
    action: {
      label: 'Ordenar más',
      onClick: () => console.log('Order more tomatoes'),
    },
  },
  {
    id: '2',
    type: 'error',
    message: 'Pedido #42 retrasado por más de 15 minutos',
    action: {
      label: 'Ver pedido',
      onClick: () => console.log('View order #42'),
    },
  },
  {
    id: '3',
    type: 'info',
    message: 'Nueva reserva para la Mesa 7 a las 8:00 PM',
    action: {
      label: 'Ver detalles',
      onClick: () => console.log('View reservation details'),
    },
  },
];

interface AlertsBannerProps {
  className?: string;
  limit?: number;
}

const AlertsBanner: React.FC<AlertsBannerProps> = ({ 
  className,
  limit = 3
}) => {
  const alerts = SAMPLE_ALERTS.slice(0, limit);
  
  return (
    <div className={cn('space-y-3', className)}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'px-4 py-3 rounded-lg flex justify-between items-center animate-fade-in',
            alert.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
            alert.type === 'error' && 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
            alert.type === 'info' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
          )}
        >
          <p className="text-sm">{alert.message}</p>
          {alert.action && (
            <button 
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium',
                alert.type === 'warning' && 'bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700',
                alert.type === 'error' && 'bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700',
                alert.type === 'info' && 'bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700'
              )}
              onClick={alert.action.onClick}
            >
              {alert.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlertsBanner;
