
import { useToast } from '@/hooks/use-toast';
import { startShift } from '@/services/cashier';
import { useShiftState } from './use-shift-state';

export const useShiftStarter = () => {
  const { setActiveShift, setIsStartingShift } = useShiftState();
  const { toast } = useToast();

  const startNewShift = async (userId: string, initialAmount: number) => {
    console.log("[useShiftStarter] Starting new shift request", { userId, initialAmount });
    
    if (!userId) {
      console.log("[useShiftStarter] Cannot start shift: No user");
      toast({
        title: "Error",
        description: "Debes iniciar sesión para iniciar un turno",
        variant: "destructive"
      });
      return null;
    }
    
    if (isNaN(initialAmount) || initialAmount <= 0) {
      console.log("[useShiftStarter] Invalid initial amount:", initialAmount);
      toast({
        title: "Error",
        description: "El monto inicial debe ser mayor a cero",
        variant: "destructive"
      });
      return null;
    }
    
    setIsStartingShift(true);
    console.log("[useShiftStarter] Starting shift process with amount:", initialAmount);
    
    try {
      console.log("[useShiftStarter] Calling startShift service");
      const newShift = await startShift({
        userId,
        initialAmount
      });
      
      if (newShift) {
        console.log("[useShiftStarter] New shift created successfully:", newShift);
        setActiveShift(newShift);
        toast({
          title: "Turno iniciado",
          description: `Turno iniciado con $${initialAmount.toLocaleString('es-ES')} en caja`
        });
        
        return newShift;
      } else {
        console.error("[useShiftStarter] Failed to create new shift - service returned null");
        toast({
          title: "Error",
          description: "No se pudo iniciar el turno",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('[useShiftStarter] Error starting shift:', error);
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

  return { startNewShift };
};
