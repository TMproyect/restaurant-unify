
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface NotificationAlert {
  id: string;
  title: string;
  description: string;
  action: string;
  type: 'warning' | 'info' | 'error' | 'success';
  link: string;
}

const AlertsBanner = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<NotificationAlert[]>([
    {
      id: 'alert-1',
      title: 'Inventario bajo',
      description: 'Algunos productos están por debajo del nivel mínimo',
      action: 'Ver inventario',
      type: 'warning',
      link: '/inventory'
    },
    {
      id: 'alert-2',
      title: 'Nuevas reservas',
      description: '3 nuevas reservas para hoy',
      action: 'Ver reservas',
      type: 'info',
      link: '/orders'
    }
  ]);

  const handleActionClick = (alertId: string) => {
    console.log(`Acción para alerta ${alertId}`);
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      toast({
        title: `Navegando a ${alert.title}`,
        description: alert.description,
      });
      navigate(alert.link);
    }
  };

  const handleDismiss = (alertId: string) => {
    console.log(`Descartando alerta ${alertId}`);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alerta descartada",
      description: "La notificación ha sido eliminada",
    });
  };

  return (
    <div className="space-y-3 mb-6">
      {alerts.length > 0 ? (
        alerts.map((alert) => (
          <Alert 
            key={alert.id}
            className={`border-l-4 ${
              alert.type === 'warning' ? 'border-l-yellow-500' : 
              alert.type === 'error' ? 'border-l-red-500' : 
              alert.type === 'success' ? 'border-l-green-500' : 
              'border-l-blue-500'
            }`}
          >
            <AlertCircle className={`w-4 h-4 ${
              alert.type === 'warning' ? 'text-yellow-500' : 
              alert.type === 'error' ? 'text-red-500' : 
              alert.type === 'success' ? 'text-green-500' : 
              'text-blue-500'
            }`} />
            <div className="flex justify-between items-start w-full">
              <div>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>
                  {alert.description}
                </AlertDescription>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  onClick={() => handleActionClick(alert.id)}
                  variant="outline" 
                  size="sm"
                >
                  {alert.action}
                </Button>
                <Button 
                  onClick={() => handleDismiss(alert.id)}
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No hay alertas para mostrar
        </div>
      )}
    </div>
  );
};

export default AlertsBanner;
