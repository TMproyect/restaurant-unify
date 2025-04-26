
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { 
  getActiveShift, 
  startShift, 
  endShift, 
  CashRegisterShift,
  loadActiveShiftFromStorage,
  saveShiftToStorage,
  removeShiftFromStorage 
} from '@/services/cashier';
import { useToast } from '@/hooks/use-toast';

export const useCashRegister = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeShift, setActiveShift] = useState<CashRegisterShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [isEndingShift, setIsEndingShift] = useState(false);
  
  // Load active shift from storage on initial load
  useEffect(() => {
    const loadShift = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        console.log("[useCashRegister] Loading shift for user:", user.id);
        // Directly check local storage first for faster response
        const storedShift = loadActiveShiftFromStorage();
        
        if (storedShift && storedShift.user_id === user.id) {
          console.log("[useCashRegister] Found stored shift:", storedShift);
          setActiveShift(storedShift);
          setIsLoading(false); // Set loading to false immediately when we have data
        } else {
          console.log("[useCashRegister] No stored shift, checking API");
          const shift = await getActiveShift(user.id);
          console.log("[useCashRegister] API shift result:", shift);
          setActiveShift(shift);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[useCashRegister] Error loading active shift:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del turno",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    loadShift();
    
    // Safety timeout to ensure loading state doesn't get stuck
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("[useCashRegister] Safety timeout reached, forcing loading to false");
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [user]);
  
  // Start a new shift
  const startNewShift = async (initialAmount: number) => {
    if (!user) {
      console.log("[useCashRegister] Cannot start shift: No user");
      toast({
        title: "Error",
        description: "Debes iniciar sesión para iniciar un turno",
        variant: "destructive"
      });
      return null;
    }
    
    if (isNaN(initialAmount) || initialAmount <= 0) {
      console.log("[useCashRegister] Invalid initial amount:", initialAmount);
      toast({
        title: "Error",
        description: "El monto inicial debe ser mayor a cero",
        variant: "destructive"
      });
      return null;
    }
    
    setIsStartingShift(true);
    try {
      console.log("[useCashRegister] Starting new shift with amount:", initialAmount);
      const newShift = await startShift({
        userId: user.id,
        initialAmount
      });
      
      if (newShift) {
        console.log("[useCashRegister] New shift created:", newShift);
        setActiveShift(newShift);
        toast({
          title: "Turno iniciado",
          description: `Turno iniciado con $${initialAmount.toLocaleString('es-ES')} en caja`
        });
        
        // Update local state first for immediate UI feedback
        setTimeout(() => {
          console.log("[useCashRegister] Reloading page to refresh interface");
          window.location.href = "/cashier"; // Use direct URL instead of reload for better routing
        }, 300);
        
        return newShift;
      } else {
        console.log("[useCashRegister] Failed to create new shift");
        toast({
          title: "Error",
          description: "No se pudo iniciar el turno",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('[useCashRegister] Error starting shift:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar el turno",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsStartingShift(false);
    }
  };
  
  // Close current shift
  const closeCurrentShift = async (finalAmount?: number) => {
    if (!activeShift || !activeShift.id) {
      console.log("[useCashRegister] Cannot close shift: No active shift");
      toast({
        title: "Error",
        description: "No hay un turno activo para cerrar",
        variant: "destructive"
      });
      return false;
    }
    
    setIsEndingShift(true);
    try {
      const calculatedAmount = finalAmount !== undefined ? 
                              finalAmount : 
                              activeShift.initial_amount + 
                              (activeShift.total_cash_sales || 0);
      
      console.log("[useCashRegister] Closing shift with final amount:", calculatedAmount);
      
      // Update local state for immediate UI feedback, using a valid status from the type definition
      setActiveShift({
        ...activeShift,
        status: 'closed', // Changed from 'closing' to 'closed' to match the type definition
        final_amount: calculatedAmount
      });
      
      const success = await endShift(activeShift.id, calculatedAmount);
      
      if (success) {
        console.log("[useCashRegister] Shift closed successfully");
        setActiveShift(null);
        toast({
          title: "Turno cerrado",
          description: "El turno ha sido cerrado exitosamente"
        });
        
        // Redirect to cashier page after brief delay
        setTimeout(() => {
          console.log("[useCashRegister] Redirecting to cashier page");
          window.location.href = "/cashier"; // Use direct URL instead of reload for better routing
        }, 300);
        
        return true;
      } else {
        console.log("[useCashRegister] Failed to close shift");
        // Reset the shift status since closing failed
        setActiveShift({
          ...activeShift,
          status: 'open', // Reset to open
          final_amount: undefined
        });
        
        toast({
          title: "Error",
          description: "No se pudo cerrar el turno",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('[useCashRegister] Error closing shift:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cerrar el turno",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsEndingShift(false);
    }
  };
  
  return {
    activeShift,
    isShiftActive: !!activeShift,
    isLoading,
    isStartingShift,
    isEndingShift,
    startNewShift,
    closeCurrentShift
  };
};
