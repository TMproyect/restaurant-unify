
import { createContext, useContext, useState, ReactNode } from 'react';
import { CashRegisterShift } from '@/services/cashier';

// Create a context to share shift state across components
type ShiftStateContextType = {
  activeShift: CashRegisterShift | null;
  setActiveShift: (shift: CashRegisterShift | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isStartingShift: boolean;
  setIsStartingShift: (starting: boolean) => void;
  isEndingShift: boolean;
  setIsEndingShift: (ending: boolean) => void;
};

const ShiftStateContext = createContext<ShiftStateContextType | undefined>(undefined);

export function ShiftStateProvider({ children }: { children: ReactNode }) {
  const [activeShift, setActiveShift] = useState<CashRegisterShift | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [isEndingShift, setIsEndingShift] = useState(false);

  return (
    <ShiftStateContext.Provider
      value={{
        activeShift,
        setActiveShift,
        isLoading,
        setIsLoading,
        isStartingShift,
        setIsStartingShift,
        isEndingShift,
        setIsEndingShift,
      }}
    >
      {children}
    </ShiftStateContext.Provider>
  );
}

export const useShiftState = (): ShiftStateContextType => {
  const context = useContext(ShiftStateContext);
  if (context === undefined) {
    return {
      activeShift: null,
      setActiveShift: () => {},
      isLoading: false,
      setIsLoading: () => {},
      isStartingShift: false,
      setIsStartingShift: () => {},
      isEndingShift: false,
      setIsEndingShift: () => {},
    };
  }
  return context;
};
