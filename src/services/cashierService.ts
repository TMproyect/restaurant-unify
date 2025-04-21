
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CashRegisterShift = {
  id?: string;
  user_id: string;
  started_at: string;
  ended_at?: string | null;
  initial_amount: number;
  final_amount?: number | null;
  status: 'open' | 'closed';
  total_sales?: number;
  total_cash_sales?: number;
  total_card_sales?: number;
  total_cash_in?: number;
  total_cash_out?: number;
  created_at?: string;
};

export type CashMovement = {
  id?: string;
  shift_id: string;
  amount: number;
  type: 'in' | 'out';
  description: string;
  created_at?: string;
  created_by: string;
};

// Función para verificar si hay un turno activo para el usuario actual
export const getActiveShift = async (userId: string): Promise<CashRegisterShift | null> => {
  try {
    console.log("Checking for active shift for user:", userId);
    
    // Emular la obtención de un turno activo
    // En un sistema real, esto sería una consulta a la base de datos
    // Por ahora, simulamos que no hay turno activo
    
    return null;
    
    // Implementación futura con Supabase:
    /*
    const { data, error } = await supabase
      .from('cash_register_shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .single();
    
    if (error) {
      console.error('Error getting active shift:', error);
      return null;
    }
    
    return data;
    */
  } catch (error) {
    console.error('Error checking active shift:', error);
    return null;
  }
};

// Función para iniciar un nuevo turno
export const startShift = async (userData: {
  userId: string,
  initialAmount: number
}): Promise<CashRegisterShift | null> => {
  try {
    console.log("Starting new shift for user:", userData.userId, "with initial amount:", userData.initialAmount);
    
    // Emular la creación de un nuevo turno
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
    
    // Guardar en localStorage para simular persistencia
    localStorage.setItem('active_shift', JSON.stringify(newShift));
    
    // Agregar un pequeño retraso para simular una operación de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newShift;
    
    // Implementación futura con Supabase:
    /*
    const { data, error } = await supabase
      .from('cash_register_shifts')
      .insert({
        user_id: userData.userId,
        initial_amount: userData.initialAmount,
        started_at: new Date().toISOString(),
        status: 'open'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error starting shift:', error);
      return null;
    }
    
    return data;
    */
  } catch (error) {
    console.error('Error starting shift:', error);
    return null;
  }
};

// Función para finalizar un turno
export const endShift = async (shiftId: string, finalAmount: number): Promise<boolean> => {
  try {
    console.log("Ending shift:", shiftId, "with final amount:", finalAmount);
    
    // Emular el cierre de un turno
    localStorage.removeItem('active_shift');
    
    return true;
    
    // Implementación futura con Supabase:
    /*
    const { error } = await supabase
      .from('cash_register_shifts')
      .update({
        ended_at: new Date().toISOString(),
        final_amount: finalAmount,
        status: 'closed'
      })
      .eq('id', shiftId);
    
    if (error) {
      console.error('Error ending shift:', error);
      return false;
    }
    
    return true;
    */
  } catch (error) {
    console.error('Error ending shift:', error);
    return false;
  }
};

// Función para registrar un movimiento de caja
export const registerCashMovement = async (movement: {
  shiftId: string,
  amount: number,
  type: 'in' | 'out',
  description: string,
  userId: string
}): Promise<boolean> => {
  try {
    console.log("Registering cash movement:", movement);
    
    // Emular el registro de un movimiento
    return true;
    
    // Implementación futura con Supabase:
    /*
    const { error } = await supabase
      .from('cash_movements')
      .insert({
        shift_id: movement.shiftId,
        amount: movement.amount,
        type: movement.type,
        description: movement.description,
        created_by: movement.userId
      });
    
    if (error) {
      console.error('Error registering cash movement:', error);
      return false;
    }
    
    return true;
    */
  } catch (error) {
    console.error('Error registering cash movement:', error);
    return false;
  }
};

// Función para cargar el turno activo desde localStorage (solo para demo)
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
