
import React from 'react';
import { Edit, Trash, Star, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { MenuItem } from '@/services/menu/menuItemService';
import MenuItemImage from '../MenuItemImage';

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, categoryName, onEdit, onDelete }) => {
  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card key={item.id} className={`overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
      <div className="relative">
        <MenuItemImage 
          imageUrl={item.image_url || ''} 
          alt={item.name}
        />
        {item.popular && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
            <Star className="h-3 w-3 mr-1 fill-current" /> Popular
          </Badge>
        )}
        {!item.available && (
          <Badge variant="outline" className="absolute top-2 left-2 bg-background/80">
            No disponible
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg truncate">{item.name}</h3>
          <Badge variant="outline" className="ml-2 whitespace-nowrap">
            {categoryName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description || "Sin descripción"}
        </p>
        <p className="text-lg font-medium mt-2">{formatPrice(item.price)}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4 mr-2" /> Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1"
            onClick={() => onDelete(item)}
          >
            <Trash className="h-4 w-4 mr-2" /> Eliminar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MenuItemCard;
