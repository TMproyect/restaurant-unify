
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useDashboardInit() {
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 [useDashboardInit] useEffect running for initialization');
    
    try {
      console.log("✅ [useDashboardInit] Starting initialization...");
      
      // Check if all required services are available
      console.log("🔍 [useDashboardInit] Checking required services...");
      
      // Add a timeout to detect if initialization is taking too long
      const timeoutId = setTimeout(() => {
        console.error("❌ [useDashboardInit] Initialization timeout reached");
        setError("La inicialización está tomando demasiado tiempo. Puede haber un problema con la conexión o con los servicios requeridos.");
      }, 10000); // 10-second timeout
      
      // Normal initialization timer
      const timer = setTimeout(() => {
        console.log("✅ [useDashboardInit] Initialization completed successfully");
        clearTimeout(timeoutId); // Clear the timeout if initialization completes
        setIsReady(true);
      }, 500);
      
      return () => {
        console.log("🔄 [useDashboardInit] Cleaning up initialization timers");
        clearTimeout(timer);
        clearTimeout(timeoutId);
      };
    } catch (err) {
      console.error("❌ [useDashboardInit] Error initializing dashboard:", err);
      console.error("❌ [useDashboardInit] Error stack:", err instanceof Error ? err.stack : 'No stack trace');
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
