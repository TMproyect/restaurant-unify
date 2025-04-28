
import React from 'react';
import { MenuItem } from '@/services/menu/menuItemService';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getImageUrlWithCacheBusting } from '@/services/storage';
import MenuItemImage from '@/components/menu/MenuItemImage';

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categoryName,
  onEdit,
  onDelete
}) => {
  // Format price to local currency string
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(item.price);
  
  const imageUrl = item.image_url 
    ? getImageUrlWithCacheBusting(item.image_url)
    : undefined;
    
  return (
    <Card className="overflow-hidden">
      <MenuItemImage 
        imageUrl={imageUrl || ''} 
        alt={item.name}
        size="md"
        onRetry={() => console.log('Retrying image load for', item.name)}
      />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{item.name}</h3>
            <p className="text-muted-foreground font-medium">{formattedPrice}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => onDelete(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {categoryName}
          </Badge>
          
          {!item.available && (
            <Badge variant="destructive" className="text-xs">
              No disponible
            </Badge>
          )}
          
          {item.popular && (
            <Badge variant="secondary" className="text-xs">
              Popular
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onEdit(item)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MenuItemCard;
