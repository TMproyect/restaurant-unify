
import { useEffect } from 'react';
import { loadActiveShiftFromStorage } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftLoader = (userId: string | undefined) => {
  const { setActiveShift, setIsLoading } = useShiftState();

  useEffect(() => {
    // Set loading to false by default to avoid infinite loading state
    setIsLoading(false);
    
    // Simple synchronous check for stored shift
    if (userId) {
      const storedShift = loadActiveShiftFromStorage();
      
      if (storedShift && storedShift.user_id === userId) {
        console.log("[useShiftLoader] Found active shift for user:", userId);
        setActiveShift(storedShift);
      } else {
        console.log("[useShiftLoader] No active shift found for user:", userId);
        setActiveShift(null);
      }
    }
  }, [userId, setActiveShift, setIsLoading]);
};
