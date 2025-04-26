
import { CashRegisterShift } from "./types";
import { loadActiveShiftFromStorage, saveShiftToStorage, removeShiftFromStorage } from "./storageService";

export const startShift = async (userData: {
  userId: string,
  initialAmount: number
}): Promise<CashRegisterShift | null> => {
  try {
    // Input validation first
    if (!userData.userId) {
      return null;
    }
    
    if (isNaN(userData.initialAmount) || userData.initialAmount <= 0) {
      return null;
    }
    
    // Create a new shift with unique ID
    const shiftId = 'shift_' + Math.random().toString(36).substr(2, 9);
    
    // Create a new shift
    const newShift: CashRegisterShift = {
      id: shiftId,
      user_id: userData.userId,
      initial_amount: userData.initialAmount,
      started_at: new Date().toISOString(),
      status: 'open',
      total_sales: 0,
      total_cash_sales: 0,
      total_card_sales: 0,
      total_cash_in: 0,
      total_cash_out: 0
    };
    
    // Store the shift in localStorage
    saveShiftToStorage(newShift);
    
    return newShift;
  } catch (error) {
    console.error('[shiftService] Error starting shift:', error);
    return null;
  }
};

export const endShift = async (shiftId: string, finalAmount: number): Promise<boolean> => {
  try {
    // Get the stored shift
    const storedShift = loadActiveShiftFromStorage();
    if (!storedShift) {
      return false;
    }
    
    if (storedShift.id !== shiftId) {
      return false;
    }
    
    // Remove from localStorage since it's no longer active
    removeShiftFromStorage();
    
    return true;
  } catch (error) {
    console.error('[shiftService] Error ending shift:', error);
    return false;
  }
};
