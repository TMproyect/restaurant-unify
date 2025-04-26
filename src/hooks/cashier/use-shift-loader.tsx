
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getActiveShift, loadActiveShiftFromStorage } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftLoader = (userId: string | undefined) => {
  const { setActiveShift, setIsLoading } = useShiftState();
  const { toast } = useToast();

  useEffect(() => {
    const loadShift = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        console.log("[useShiftLoader] Loading shift for user:", userId);
        const storedShift = loadActiveShiftFromStorage();
        
        if (storedShift && storedShift.user_id === userId) {
          console.log("[useShiftLoader] Found stored shift:", storedShift);
          setActiveShift(storedShift);
          setIsLoading(false);
        } else {
          console.log("[useShiftLoader] No stored shift, checking API");
          const shift = await getActiveShift(userId);
          console.log("[useShiftLoader] API shift result:", shift);
          setActiveShift(shift);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[useShiftLoader] Error loading active shift:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del turno",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    loadShift();
    
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [userId, setActiveShift, setIsLoading, toast]);
};
