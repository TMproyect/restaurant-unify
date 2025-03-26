
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface InventoryItemAlert {
  name: string;
  current: number;
  minimum: number;
  unit: string;
}

interface InventoryAlertProps {
  item: InventoryItemAlert;
}

const InventoryAlert: React.FC<InventoryAlertProps> = ({ item }) => {
  const { toast } = useToast();

  const handleRequestMore = () => {
    toast({
      title: "Solicitud enviada",
      description: `Se ha enviado una solicitud de reabastecimiento para ${item.name}`,
    });
  };

  return (
    <Card className="border-l-4 border-l-red-500">
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

export default InventoryAlert;
