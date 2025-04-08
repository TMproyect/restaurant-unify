
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
  const [actualImageUrl, setActualImageUrl] = useState('');
  const maxRetries = 2;
  
  // Asegurarnos de que la URL sea limpia para evitar problemas de caché
  useEffect(() => {
    // Añadir parámetro para evitar caché
    const cleanBaseUrl = imageUrl.split('?')[0];
    const newUrl = `${cleanBaseUrl}?t=${Date.now()}`;
    setActualImageUrl(newUrl);
    
    // Resetear estados cuando cambia la URL de la imagen
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    
    console.log('🖼️ URL de imagen preparada:', newUrl);
  }, [imageUrl]);
  
  const retryLoading = () => {
    if (retryCount < maxRetries) {
      console.log(`🖼️ Reintentando cargar imagen (${retryCount + 1}/${maxRetries}):`, actualImageUrl);
      
      // Generar nueva URL con timestamp para forzar recarga sin caché
      const baseUrl = actualImageUrl.split('?')[0];
      const forcedUrl = `${baseUrl}?t=${Date.now()}`;
      setActualImageUrl(forcedUrl);
      
      // Resetear estados
      setIsLoading(true);
      setHasError(false);
      setRetryCount(prev => prev + 1);
      
      console.log('🖼️ Forzando recarga con URL:', forcedUrl);
    }
  };
  
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
          src={actualImageUrl} 
          alt={alt} 
          className={className}
          style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={() => {
            console.log('🖼️ Imagen cargada correctamente:', actualImageUrl);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error('🖼️ Error al cargar imagen:', actualImageUrl, e);
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
