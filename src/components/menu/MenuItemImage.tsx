
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImageOff, RefreshCw } from 'lucide-react';

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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  // URL limpia para máxima compatibilidad - sin parámetros
  const cleanImageUrl = imageUrl.split('?')[0];
  
  const retryLoading = () => {
    if (retryCount < maxRetries) {
      console.log(`🖼️ Reintentando cargar imagen (${retryCount + 1}/${maxRetries}):`, cleanImageUrl);
      setIsLoading(true);
      setHasError(false);
      setRetryCount(prev => prev + 1);
      
      // Forzar recarga con un nuevo timestamp para evitar caché
      const imgElement = document.querySelector(`img[data-src="${cleanImageUrl}"]`) as HTMLImageElement;
      if (imgElement) {
        const forcedUrl = `${cleanImageUrl}?t=${Date.now()}`;
        imgElement.src = forcedUrl;
        console.log('🖼️ Forzando recarga con URL:', forcedUrl);
      }
    }
  };
  
  useEffect(() => {
    // Resetear estados cuando cambia la URL de la imagen
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [imageUrl]);
  
  return (
    <div className="relative w-full">
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
              onClick={retryLoading}
              disabled={retryCount >= maxRetries}
            >
              {retryCount < maxRetries ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </>
              ) : (
                <>
                  <ImageOff className="h-4 w-4 mr-2" />
                  Imagen no disponible
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <img 
          src={cleanImageUrl} 
          alt={alt} 
          className={className}
          data-src={cleanImageUrl}
          style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={() => {
            console.log('🖼️ Imagen cargada correctamente:', cleanImageUrl);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error('🖼️ Error al cargar imagen:', cleanImageUrl, e);
            setIsLoading(false);
            setHasError(true);
            
            // Reintento automático sin demora la primera vez
            if (retryCount === 0) {
              retryLoading();
            }
          }}
        />
      )}
    </div>
  );
};

export default MenuItemImage;
