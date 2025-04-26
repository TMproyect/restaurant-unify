
import { useToast } from '@/hooks/use-toast';
import { endShift } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftEnder = () => {
  const { activeShift, setActiveShift, setIsEndingShift } = useShiftState();
  const { toast } = useToast();

  const closeCurrentShift = async (finalAmount?: number) => {
    if (!activeShift || !activeShift.id) {
      console.log("[useShiftEnder] Cannot close shift: No active shift");
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
      
      console.log("[useShiftEnder] Closing shift with final amount:", calculatedAmount);
      
      setActiveShift({
        ...activeShift,
        status: 'closed',
        final_amount: calculatedAmount
      });
      
      const success = await endShift(activeShift.id, calculatedAmount);
      
      if (success) {
        console.log("[useShiftEnder] Shift closed successfully");
        setActiveShift(null);
        toast({
          title: "Turno cerrado",
          description: "El turno ha sido cerrado exitosamente"
        });
        
        setTimeout(() => {
          console.log("[useShiftEnder] Redirecting to cashier page");
          window.location.href = "/cashier";
        }, 300);
        
        return true;
      } else {
        console.log("[useShiftEnder] Failed to close shift");
        setActiveShift({
          ...activeShift,
          status: 'open',
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
      console.error('[useShiftEnder] Error closing shift:', error);
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

  return { closeCurrentShift };
};
