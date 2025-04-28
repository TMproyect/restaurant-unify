
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImageOff, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onRetry?: () => void;
  fit?: 'cover' | 'contain';
}

const MenuItemImage = ({ 
  imageUrl, 
  alt, 
  className = "", 
  size = 'md',
  fit = 'contain',
  onRetry
}: MenuItemImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isBase64, setIsBase64] = useState(false);
  const [retries, setRetries] = useState(0);
  
  // Check if the image is Base64 encoded
  useEffect(() => {
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      setIsBase64(true);
      setIsLoading(false); // Base64 images don't need to load
      setHasError(false); // Reset error state
    } else {
      setIsBase64(false);
      // When URL changes, reset states
      setIsLoading(true);
      setHasError(false);
    }
  }, [imageUrl]);
  
  const heightClass = {
    'sm': 'h-32',
    'md': 'h-44',
    'lg': 'h-56'
  }[size];
  
  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetries(prev => prev + 1);
    onRetry?.();
  };
  
  // If there's no image URL, show placeholder
  if (!imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted flex items-center justify-center", heightClass, className)}>
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">Sin imagen</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative overflow-hidden bg-muted", heightClass, className)}>
      {isLoading && !isBase64 && !hasError && (
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
            <span className="text-sm">Error de imagen</span>
            <Button 
              variant="ghost" 
              size="sm"
              className="mt-1"
              onClick={handleRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reintentar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <img 
            src={imageUrl + (isBase64 ? '' : `?t=${retries}`)} 
            alt={alt} 
            className={cn("w-full h-full", isBase64 ? "image-base64" : "")}
            style={{ 
              display: (isLoading && !isBase64) ? 'none' : 'block',
              objectFit: fit
            }}
            onLoad={() => {
              if (!isBase64) {
                setIsLoading(false);
              }
            }}
            onError={() => {
              if (!isBase64) {
                setIsLoading(false);
                setHasError(true);
                console.error(`📦 Error cargando imagen: ${imageUrl}`);
              }
            }}
          />
          {isBase64 && (
            <div className="absolute bottom-0 right-0 bg-amber-500 text-white text-xs px-1 py-0.5 rounded-tl">
              Base64
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MenuItemImage;
