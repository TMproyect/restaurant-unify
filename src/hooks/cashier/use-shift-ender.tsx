
import { useToast } from '@/hooks/use-toast';
import { endShift } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftEnder = () => {
  const { activeShift, setActiveShift, setIsEndingShift } = useShiftState();
  const { toast } = useToast();

  const closeCurrentShift = async (finalAmount?: number) => {
    if (!activeShift || !activeShift.id) {
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
      
      const success = await endShift(activeShift.id, calculatedAmount);
      
      if (success) {
        setActiveShift(null);
        toast({
          title: "Turno cerrado",
          description: "El turno ha sido cerrado exitosamente"
        });
        
        return true;
      } else {
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
