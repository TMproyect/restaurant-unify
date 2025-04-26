import { supabase } from "@/integrations/supabase/client";
import { CashRegisterShift } from "./types";
import { loadActiveShiftFromStorage, saveShiftToStorage, removeShiftFromStorage } from "./storageService";

export const getActiveShift = async (userId: string): Promise<CashRegisterShift | null> => {
  try {
    // Fast check in localStorage only - no API call
    const storedShift = loadActiveShiftFromStorage();
    if (storedShift && storedShift.user_id === userId && storedShift.status === 'open') {
      return storedShift;
    }
    
    return null;
  } catch (error) {
    console.error('[shiftService] Error:', error);
    return null;
  }
};

export const startShift = async (userData: {
  userId: string,
  initialAmount: number
}): Promise<CashRegisterShift | null> => {
  try {
    console.log("[shiftService] Starting new shift for user:", userData.userId, "with initial amount:", userData.initialAmount);
    
    // Check if there's already an active shift
    const existingShift = await getActiveShift(userData.userId);
    if (existingShift) {
      console.log("[shiftService] User already has an active shift:", existingShift);
      return existingShift;
    }
    
    // Create a new shift
    const newShift: CashRegisterShift = {
      id: 'shift_' + Math.random().toString(36).substr(2, 9),
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
    console.log("[shiftService] New shift created and stored:", newShift);
    
    return newShift;
  } catch (error) {
    console.error('[shiftService] Error starting shift:', error);
    return null;
  }
};

export const endShift = async (shiftId: string, finalAmount: number): Promise<boolean> => {
  try {
    console.log("[shiftService] Ending shift:", shiftId, "with final amount:", finalAmount);
    
    // Get the stored shift
    const storedShift = loadActiveShiftFromStorage();
    if (!storedShift) {
      console.error("[shiftService] No active shift found to close");
      return false;
    }
    
    if (storedShift.id !== shiftId) {
      console.error("[shiftService] Shift ID mismatch when closing. Expected:", shiftId, "Got:", storedShift.id);
      return false;
    }
    
    // Update shift with closing details
    const closedShift = {
      ...storedShift,
      status: 'closed',
      ended_at: new Date().toISOString(),
      final_amount: finalAmount
    };
    
    console.log("[shiftService] Shift closed successfully:", closedShift);
    
    // Remove from localStorage since it's no longer active
    removeShiftFromStorage();
    
    return true;
  } catch (error) {
    console.error('[shiftService] Error ending shift:', error);
    return false;
  }
};
