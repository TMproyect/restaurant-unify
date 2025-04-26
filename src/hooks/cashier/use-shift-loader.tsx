
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getActiveShift, loadActiveShiftFromStorage } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftLoader = (userId: string | undefined) => {
  const { setActiveShift, setIsLoading } = useShiftState();
  const { toast } = useToast();

  useEffect(() => {
    // Immediately set not loading - we'll skip verification
    setIsLoading(false);
    
    const loadShift = async () => {
      if (!userId) return;
      
      try {
        // Simple check for stored shift only - skip API verification
        const storedShift = loadActiveShiftFromStorage();
        
        if (storedShift && storedShift.user_id === userId) {
          console.log("[useShiftLoader] Using stored shift data");
          setActiveShift(storedShift);
        }
      } catch (error) {
        console.error('[useShiftLoader] Error:', error);
      }
    };
    
    // Load shift data but don't block UI
    loadShift();
  }, [userId, setActiveShift, setIsLoading, toast]);
};
