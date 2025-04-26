
import { useState } from 'react';
import { CashRegisterShift } from '@/services/cashier';

export const useShiftState = () => {
  const [activeShift, setActiveShift] = useState<CashRegisterShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [isEndingShift, setIsEndingShift] = useState(false);

  return {
    activeShift,
    setActiveShift,
    isLoading,
    setIsLoading,
    isStartingShift,
    setIsStartingShift,
    isEndingShift,
    setIsEndingShift,
  };
};
