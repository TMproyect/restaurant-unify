
import { supabase } from "@/integrations/supabase/client";
import { CashRegisterShift } from "./types";

const STORAGE_KEY = 'active_shift';

export const getActiveShift = async (userId: string): Promise<CashRegisterShift | null> => {
  try {
    console.log("[shiftService] Checking for active shift for user:", userId);
    
    // First check localStorage for active shift
    const storedShift = localStorage.getItem(STORAGE_KEY);
    if (storedShift) {
      try {
        const shift = JSON.parse(storedShift);
        if (shift && shift.user_id === userId && shift.status === 'open') {
          console.log("[shiftService] Found active shift in local storage:", shift);
          return shift;
        }
      } catch (e) {
        console.error("[shiftService] Error parsing stored shift:", e);
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    
    // If no shift is found, return null (no active shift)
    console.log("[shiftService] No active shift found for user");
    return null;
  } catch (error) {
    console.error('[shiftService] Error checking active shift:', error);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newShift));
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
    
    const storedShift = localStorage.getItem(STORAGE_KEY);
    if (!storedShift) {
      console.error("[shiftService] No active shift found to close");
      return false;
    }
    
    try {
      const shift = JSON.parse(storedShift);
      if (shift.id !== shiftId) {
        console.error("[shiftService] Shift ID mismatch when closing");
        return false;
      }
      
      // Update shift with closing details
      const closedShift = {
        ...shift,
        status: 'closed',
        ended_at: new Date().toISOString(),
        final_amount: finalAmount
      };
      
      // For a real implementation, we would store the closed shift in a database
      // For this demo, we'll just remove it from localStorage
      localStorage.removeItem(STORAGE_KEY);
      console.log("[shiftService] Shift closed successfully:", closedShift);
      
      return true;
    } catch (e) {
      console.error("[shiftService] Error parsing stored shift during close:", e);
      return false;
    }
  } catch (error) {
    console.error('[shiftService] Error ending shift:', error);
    return false;
  }
};
