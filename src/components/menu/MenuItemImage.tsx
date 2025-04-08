
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageOff } from 'lucide-react';

interface MenuItemImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

const MenuItemImage = ({ 
  imageUrl, 
  alt, 
  className = "rounded-t-lg w-full h-44 object-cover" 
}: MenuItemImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="relative w-full h-44 overflow-hidden">
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 w-full h-full rounded-t-lg"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center h-44 bg-muted text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              disabled={true}
            >
              <ImageOff className="h-4 w-4 mr-2" />
              Imagen no disponible
            </Button>
          </div>
        </div>
      ) : (
        <img 
          src={imageUrl} 
          alt={alt} 
          className={className}
          style={{ 
            display: isLoading ? 'none' : 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onLoad={() => {
            console.log('🖼️ Imagen cargada correctamente');
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error('🖼️ Error al cargar imagen:', e);
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
};

export default MenuItemImage;
