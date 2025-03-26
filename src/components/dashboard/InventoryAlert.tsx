
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Inventory items in alert status
const alertItems = [
  {
    name: "Tomates",
    current: 15,
    minimum: 20,
    unit: "kg"
  },
  {
    name: "Queso mozzarella",
    current: 8,
    minimum: 10,
    unit: "kg"
  },
  {
    name: "Aceite de oliva",
    current: 5,
    minimum: 10,
    unit: "l"
  }
];

export interface InventoryItemAlert {
  name: string;
  current: number;
  minimum: number;
  unit: string;
}

interface InventoryAlertProps {
  item?: InventoryItemAlert;
}

const AlertItem: React.FC<{ item: InventoryItemAlert }> = ({ item }) => {
  const { toast } = useToast();

  const handleRequestMore = () => {
    // Show toast notification
    toast({
      title: "Solicitud enviada",
      description: `Se ha enviado una solicitud de reabastecimiento para ${item.name}`,
    });
    
    // In a real app, you would also send this request to your backend
    console.log(`Requesting more ${item.name}: Current ${item.current}${item.unit}, Minimum ${item.minimum}${item.unit}`);
  };

  return (
    <Card className="border-l-4 border-l-red-500 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-red-700 dark:text-red-400">{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Quedan {item.current}{item.unit} (Mínimo: {item.minimum}{item.unit})
        </p>
        <Button 
          className="w-full bg-red-600 hover:bg-red-700"
          onClick={handleRequestMore}
        >
          Solicitar más
        </Button>
      </CardContent>
    </Card>
  );
};

const InventoryAlert: React.FC<InventoryAlertProps> = () => {
  if (alertItems.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No hay alertas de inventario</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alertItems.map((item, index) => (
        <AlertItem key={index} item={item} />
      ))}
    </div>
  );
};

export default InventoryAlert;
