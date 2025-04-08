
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { InventoryItem, getLowStockItems } from '@/services/inventoryService';
import { useQuery } from '@tanstack/react-query';

interface LowStockAlertProps {
  onViewInventory?: () => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ onViewInventory }) => {
  const { toast } = useToast();
  
  const { data: alertItems = [], isLoading } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: () => getLowStockItems(5),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  const handleRequestMore = (item: InventoryItem) => {
    // Mostrar notificación
    toast({
      title: "Solicitud enviada",
      description: `Se ha enviado una solicitud de reabastecimiento para ${item.name}`,
    });
    
    // En una app real, enviarías esta solicitud a tu backend
    console.log(`Requesting more ${item.name}: Current ${item.stock_quantity}${item.unit}, Minimum ${item.min_stock_level}${item.unit}`);
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-l-4 border-l-gray-200">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (alertItems.length === 0) {
    return (
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="text-center p-6">
          <p className="text-green-700">No hay alertas de inventario</p>
          <p className="text-green-600 text-sm mt-1">Todos los ingredientes tienen stock suficiente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {alertItems.map((item) => (
        <Card key={item.id} className="border-l-4 border-l-red-500 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-red-700 dark:text-red-400">{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Quedan {item.stock_quantity}{item.unit} (Mínimo: {item.min_stock_level}{item.unit})
            </p>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => handleRequestMore(item)}
            >
              Solicitar más
            </Button>
          </CardContent>
        </Card>
      ))}
      
      {onViewInventory && (
        <Button 
          variant="outline" 
          className="w-full mt-2"
          onClick={onViewInventory}
        >
          Ver todo el inventario
        </Button>
      )}
    </div>
  );
};

export default LowStockAlert;
