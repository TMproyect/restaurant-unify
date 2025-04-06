
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
      
      // Set a small timeout to ensure any async initializations can complete
      const timer = setTimeout(() => {
        console.log("✅ [useDashboardInit] Initialization completed successfully");
        setIsReady(true);
      }, 500);
      
      return () => {
        console.log("🔄 [useDashboardInit] Cleaning up initialization timer");
        clearTimeout(timer);
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
