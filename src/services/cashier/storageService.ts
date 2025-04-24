
import { CashRegisterShift } from "./types";

export const loadActiveShiftFromStorage = (): CashRegisterShift | null => {
  const storedShift = localStorage.getItem('active_shift');
  if (storedShift) {
    try {
      return JSON.parse(storedShift);
    } catch (error) {
      console.error('Error parsing stored shift:', error);
      return null;
    }
  }
  return null;
};
