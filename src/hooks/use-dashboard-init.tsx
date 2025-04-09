
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useDashboardInit() {
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 [useDashboardInit] Initializing dashboard...');
    
    try {
      // Set a reasonable timeout to detect initialization issues
      const timeoutId = setTimeout(() => {
        console.error("❌ [useDashboardInit] Initialization timeout reached");
        setError("La inicialización está tomando demasiado tiempo. Puede haber un problema con la conexión.");
      }, 15000); // 15-second timeout
      
      // Normal initialization timer - set a short delay to allow React to render initial UI
      const timer = setTimeout(() => {
        console.log("✅ [useDashboardInit] Initialization completed successfully");
        clearTimeout(timeoutId); // Clear the timeout if initialization completes
        setIsReady(true);
      }, 200);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(timeoutId);
      };
    } catch (err) {
      console.error("❌ [useDashboardInit] Error initializing dashboard:", err);
      setError("Error al cargar el dashboard. Por favor, recargue la página.");
      
      toast({
        title: "Error en el Dashboard",
        description: "Hubo un problema al inicializar el dashboard. Intente recargar la página.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return { error, isReady };
}
