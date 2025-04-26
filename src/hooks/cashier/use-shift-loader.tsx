
import { useEffect } from 'react';
import { loadActiveShiftFromStorage } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftLoader = (userId: string | undefined) => {
  const { setActiveShift, setIsLoading } = useShiftState();

  useEffect(() => {
    const loadShift = async () => {
      try {
        console.log("[useShiftLoader] Loading shift for user:", userId);
        
        // Start with loading state true
        setIsLoading(true);
        
        // Directly use stored shift - no API verification
        if (userId) {
          const storedShift = loadActiveShiftFromStorage();
          console.log("[useShiftLoader] Stored shift loaded:", storedShift);
          
          if (storedShift && storedShift.user_id === userId) {
            console.log("[useShiftLoader] Setting active shift");
            setActiveShift(storedShift);
          } else {
            console.log("[useShiftLoader] No active shift found for user");
            setActiveShift(null);
          }
        }
      } catch (error) {
        console.error("[useShiftLoader] Error loading shift:", error);
        setActiveShift(null);
      } finally {
        // Always ensure we exit loading state
        console.log("[useShiftLoader] Finished loading shift");
        setIsLoading(false);
      }
    };

    loadShift();
  }, [userId, setActiveShift, setIsLoading]);
};
