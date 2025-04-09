
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  onAddToCart: (itemId: string) => void;
}

const OrderMenuItem: React.FC<MenuItemProps> = ({
  id,
  name,
  description,
  price,
  onAddToCart
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between mb-2">
          <h3 className="font-medium">{name}</h3>
          <span className="font-bold">${price.toFixed(2)}</span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </CardContent>
      <CardFooter className="p-2 bg-muted/30 flex justify-end">
        <Button 
          size="sm" 
          onClick={() => onAddToCart(id)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderMenuItem;
