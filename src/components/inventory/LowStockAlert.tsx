
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { InventoryItem, getLowStockItems } from '@/services/inventoryService';
import { useQuery } from '@tanstack/react-query';

interface LowStockAlertProps {
  onViewInventory?: () => void;
  compact?: boolean;
  maxItems?: number;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ 
  onViewInventory, 
  compact = false,
  maxItems = 3
}) => {
  const { toast } = useToast();
  console.log('🔄 [LowStockAlert] Rendering with compact mode:', compact);
  
  const { data: alertItems = [], isLoading, error } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: () => getLowStockItems(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  if (error) {
    console.error('❌ [LowStockAlert] Error fetching low stock items:', error);
  }

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
      <div className="animate-pulse space-y-3">
        {[1, 2, compact ? 1 : 3].map(i => (
          <Card key={i} className="border-l-4 border-l-gray-200">
            <CardContent className="p-3">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (alertItems.length === 0) {
    return (
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="text-center p-4">
          <p className="text-green-700">No hay alertas de inventario</p>
          <p className="text-green-600 text-sm mt-1">Todos los ingredientes tienen stock suficiente</p>
        </CardContent>
      </Card>
    );
  }

  // Limitar el número de elementos mostrados según el modo compacto
  const displayItems = compact ? alertItems.slice(0, maxItems) : alertItems;
  const hasMoreItems = compact && alertItems.length > maxItems;

  return (
    <div className="space-y-2">
      {displayItems.map((item) => (
        <Card 
          key={item.id} 
          className={`border-l-4 border-l-red-500 overflow-hidden ${compact ? 'mb-2' : 'mb-4'}`}
        >
          <CardContent className={compact ? "p-3" : "p-6"}>
            <h3 className="font-semibold text-red-700">{item.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Quedan {item.stock_quantity}{item.unit} (Mínimo: {item.min_stock_level}{item.unit})
            </p>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700"
              size={compact ? "sm" : "default"}
              onClick={() => handleRequestMore(item)}
            >
              Solicitar más
            </Button>
          </CardContent>
        </Card>
      ))}
      
      {hasMoreItems && (
        <div className="text-center text-sm text-muted-foreground mt-1">
          <span>Mostrando {maxItems} de {alertItems.length} alertas</span>
        </div>
      )}
      
      {onViewInventory && (
        <Button 
          variant="outline" 
          className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={onViewInventory}
          size={compact ? "sm" : "default"}
        >
          <span>Ver todo el inventario</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default LowStockAlert;
