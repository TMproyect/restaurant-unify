
import { useAuth } from '@/contexts/auth/AuthContext';
import { useShiftState } from './cashier/use-shift-state';
import { useShiftLoader } from './cashier/use-shift-loader';
import { useShiftStarter } from './cashier/use-shift-starter';
import { useShiftEnder } from './cashier/use-shift-ender';

export const useCashRegister = () => {
  const { user } = useAuth();
  const {
    activeShift,
    isLoading,
    isStartingShift,
    isEndingShift
  } = useShiftState();
  
  useShiftLoader(user?.id);
  const { startNewShift } = useShiftStarter();
  const { closeCurrentShift } = useShiftEnder();
  
  return {
    activeShift,
    isShiftActive: !!activeShift,
    isLoading,
    isStartingShift,
    isEndingShift,
    startNewShift: (initialAmount: number) => startNewShift(user?.id || '', initialAmount),
    closeCurrentShift
  };
};
