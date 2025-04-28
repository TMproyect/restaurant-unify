
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { initializeStorage } from '@/services/storage';
import { toast } from 'sonner';
import MenuImagesRepair from './storage/MenuImagesRepair';

const MenuStorageInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Inicializar automáticamente al cargar
  useEffect(() => {
    const initStorage = async () => {
      try {
        setInitializing(true);
        setError(null);
        
        const success = await initializeStorage();
        
        if (success) {
          setInitialized(true);
        } else {
          console.warn('⚠️ No se pudo inicializar el almacenamiento automáticamente');
        }
      } catch (err) {
        console.error('Error al inicializar almacenamiento:', err);
        setError('No se pudo inicializar el almacenamiento');
      } finally {
        setInitializing(false);
      }
    };
    
    initStorage();
  }, []);
  
  // Reintentar manualmente
  const handleRetry = async () => {
    try {
      setInitializing(true);
      setError(null);
      
      const success = await initializeStorage();
      
      if (success) {
        toast.success('Almacenamiento inicializado correctamente');
        setInitialized(true);
      } else {
        toast.error('No se pudo inicializar el almacenamiento');
        setError('Fallo al inicializar');
      }
    } catch (err) {
      console.error('Error al reintentar inicialización:', err);
      setError('Error al reintentar');
      toast.error('Error al inicializar el almacenamiento');
    } finally {
      setInitializing(false);
    }
  };
  
  // Si se inicializó correctamente, no mostrar nada
  if (initialized && !error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MenuImagesRepair />
      </div>
    );
  }
  
  // Mostrar una tarjeta con el estado y opciones de reintento
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {error ? (
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          ) : initializing ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Inicializando almacenamiento...</p>
            </div>
          ) : (
            <p>No se ha inicializado el almacenamiento</p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            onClick={handleRetry} 
            disabled={initializing}
          >
            {initializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : (
              "Reintentar inicialización"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <MenuImagesRepair />
    </div>
  );
};

export default MenuStorageInitializer;
