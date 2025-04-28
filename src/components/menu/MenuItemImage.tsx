
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onRetry?: () => void;
}

const MenuItemImage = ({ 
  imageUrl, 
  alt, 
  className = "", 
  size = 'md',
  onRetry
}: MenuItemImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const heightClass = {
    'sm': 'h-32',
    'md': 'h-44',
    'lg': 'h-56'
  }[size];
  
  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    onRetry?.();
  };
  
  return (
    <div className={cn("relative overflow-hidden bg-muted", heightClass, className)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-muted/80 w-full h-full rounded-t-lg flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        </div>
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <ImageOff className="h-8 w-8 mb-2" />
            <span className="text-sm">No disponible</span>
            {onRetry && (
              <Button 
                variant="ghost" 
                size="sm"
                className="mt-1"
                onClick={handleRetry}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reintentar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <img 
          src={imageUrl} 
          alt={alt} 
          className="w-full h-full object-cover"
          style={{ 
            display: isLoading ? 'none' : 'block',
          }}
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
};

export default MenuItemImage;
