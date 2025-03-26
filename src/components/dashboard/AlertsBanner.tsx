
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AlertsBanner = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sample alerts - In a real app, these would come from your backend
  const alerts = [
    {
      id: 'alert-1',
      title: 'Inventario bajo',
      description: 'Algunos productos están por debajo del nivel mínimo',
      action: 'Ver inventario',
      type: 'warning'
    },
    {
      id: 'alert-2',
      title: 'Nuevas reservas',
      description: '3 nuevas reservas para hoy',
      action: 'Ver reservas',
      type: 'info'
    }
  ];

  const handleActionClick = (alertId: string, action: string) => {
    // Handle different actions based on the alert type
    switch(alertId) {
      case 'alert-1':
        toast({
          title: "Navegando al inventario",
          description: "Revisando productos con bajo stock",
        });
        navigate('/inventory');
        break;
      case 'alert-2':
        toast({
          title: "Revisando reservas",
          description: "Mostrando las reservas de hoy",
        });
        // In a real app, you might navigate to a reservations page
        console.log('View reservation details');
        break;
      default:
        // Default action if needed
        break;
    }
  };

  const handleDismiss = (alertId: string) => {
    // In a real application, you would update state to remove this alert
    // For now, we'll just show a toast notification
    toast({
      title: "Alerta descartada",
      description: "La notificación ha sido eliminada",
    });
    console.log(`Dismissed alert ${alertId}`);
  };

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id}
          className={`border-l-4 ${
            alert.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
          }`}
        >
          <AlertCircle className={`w-4 h-4 ${
            alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
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
                onClick={() => handleActionClick(alert.id, alert.action)}
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
      ))}
    </div>
  );
};

export default AlertsBanner;
