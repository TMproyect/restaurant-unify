
import { supabase } from "@/integrations/supabase/client";
import { CashRegisterShift } from "./types";

export const getActiveShift = async (userId: string): Promise<CashRegisterShift | null> => {
  try {
    console.log("Checking for active shift for user:", userId);
    return null;
  } catch (error) {
    console.error('Error checking active shift:', error);
    return null;
  }
};

export const startShift = async (userData: {
  userId: string,
  initialAmount: number
}): Promise<CashRegisterShift | null> => {
  try {
    console.log("Starting new shift for user:", userData.userId, "with initial amount:", userData.initialAmount);
    
    const newShift: CashRegisterShift = {
      user_id: userData.userId,
      initial_amount: userData.initialAmount,
      started_at: new Date().toISOString(),
      status: 'open',
      total_sales: 0,
      total_cash_sales: 0,
      total_card_sales: 0,
      total_cash_in: 0,
      total_cash_out: 0,
      id: 'shift_' + Math.random().toString(36).substr(2, 9)
    };
    
    localStorage.setItem('active_shift', JSON.stringify(newShift));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newShift;
    
  } catch (error) {
    console.error('Error starting shift:', error);
    return null;
  }
};

export const endShift = async (shiftId: string, finalAmount: number): Promise<boolean> => {
  try {
    console.log("Ending shift:", shiftId, "with final amount:", finalAmount);
    localStorage.removeItem('active_shift');
    return true;
  } catch (error) {
    console.error('Error ending shift:', error);
    return false;
  }
};
