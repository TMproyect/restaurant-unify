
import { useEffect } from 'react';
import { loadActiveShiftFromStorage } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftLoader = (userId: string | undefined) => {
  const { setActiveShift, setIsLoading } = useShiftState();

  useEffect(() => {
    // Immediately set not loading
    setIsLoading(false);
    
    // Directly use stored shift - no API verification
    if (userId) {
      const storedShift = loadActiveShiftFromStorage();
      if (storedShift && storedShift.user_id === userId) {
        setActiveShift(storedShift);
      }
    }
  }, [userId, setActiveShift, setIsLoading]);
};
