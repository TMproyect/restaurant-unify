
import { supabase } from "@/integrations/supabase/client";
import { CashMovement } from "./types";

export const registerCashMovement = async (movement: {
  shiftId: string,
  amount: number,
  type: 'in' | 'out',
  description: string,
  userId: string
}): Promise<boolean> => {
  try {
    console.log("Registering cash movement:", movement);
    return true;
  } catch (error) {
    console.error('Error registering cash movement:', error);
    return false;
  }
};
