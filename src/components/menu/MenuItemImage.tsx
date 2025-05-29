
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface MenuItemImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fit?: 'cover' | 'contain';
}

const MenuItemImage = ({ 
  imageUrl, 
  alt, 
  className = "", 
  size = 'md',
  fit = 'contain'
}: MenuItemImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBase64, setIsBase64] = useState(false);
  
  // Determinar si la imagen es Base64 y preparar estados iniciales
  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      setLoaded(false);
      return;
    }
    
    const isDataUrl = imageUrl.startsWith('data:image/');
    setIsBase64(isDataUrl);
    
    // Las imágenes Base64 no necesitan cargarse
    if (isDataUrl) {
      setLoaded(true);
      setHasError(false);
    } else {
      setLoaded(false);
      setHasError(false);
    }
  }, [imageUrl]);
  
  const heightClass = {
    'sm': 'h-32',
    'md': 'h-44',
    'lg': 'h-56'
  }[size];
  
  // Si no hay imagen, mostrar un placeholder elegante
  if (!imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted flex items-center justify-center", heightClass, className)}>
        <div className="flex flex-col items-center text-muted-foreground">
          <ImageOff className="h-6 w-6 opacity-40" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative overflow-hidden bg-muted", heightClass, className)}>
      {/* Placeholder mientras carga - solo para imágenes no Base64 que están cargando */}
      {!loaded && !hasError && !isBase64 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Estado de error - diseño simple y discreto */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
            <ImageOff className="h-6 w-6 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Error al cargar imagen</span>
          </div>
        </div>
      )}
      
      {/* La imagen real */}
      <img 
        src={imageUrl}
        alt={alt} 
        className={cn(
          "w-full h-full transition-opacity duration-200", 
          loaded && !hasError ? "opacity-100" : "opacity-0"
        )}
        style={{ objectFit: fit }}
        onLoad={() => {
          console.log(`✅ Imagen cargada exitosamente: ${imageUrl}`);
          setLoaded(true);
          setHasError(false);
        }}
        onError={() => {
          console.error(`❌ Error al cargar imagen: ${imageUrl}`);
          setHasError(true);
          setLoaded(false);
        }}
      />
    </div>
  );
};

export default MenuItemImage;
