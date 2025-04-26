
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getActiveShift, loadActiveShiftFromStorage } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftLoader = (userId: string | undefined) => {
  const { setActiveShift, setIsLoading } = useShiftState();
  const { toast } = useToast();

  useEffect(() => {
    let isComponentMounted = true;
    
    const loadShift = async () => {
      if (!userId) {
        if (isComponentMounted) setIsLoading(false);
        return;
      }
      
      if (isComponentMounted) setIsLoading(true);
      
      try {
        console.log("[useShiftLoader] Loading shift for user:", userId);
        const storedShift = loadActiveShiftFromStorage();
        
        if (storedShift && storedShift.user_id === userId) {
          console.log("[useShiftLoader] Found stored shift:", storedShift);
          if (isComponentMounted) {
            setActiveShift(storedShift);
            setIsLoading(false);
          }
        } else {
          console.log("[useShiftLoader] No stored shift, checking API");
          const shift = await getActiveShift(userId);
          console.log("[useShiftLoader] API shift result:", shift);
          if (isComponentMounted) {
            setActiveShift(shift);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('[useShiftLoader] Error loading active shift:', error);
        if (isComponentMounted) {
          toast({
            title: "Error",
            description: "No se pudo cargar la información del turno",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      }
    };
    
    loadShift();
    
    // Add safety timeout to prevent UI from being stuck in loading state indefinitely
    const timeout = setTimeout(() => {
      if (isComponentMounted) {
        console.log("[useShiftLoader] Safety timeout triggered, resetting loading state");
        setIsLoading(false);
      }
    }, 5000); // Increased timeout to 5 seconds to give more time for loading
    
    return () => {
      isComponentMounted = false;
      clearTimeout(timeout);
    };
  }, [userId, setActiveShift, setIsLoading, toast]);
};
