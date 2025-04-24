import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { 
  getActiveShift, 
  startShift, 
  endShift, 
  CashRegisterShift,
  loadActiveShiftFromStorage 
} from '@/services/cashier';
import { useToast } from '@/hooks/use-toast';

export const useCashRegister = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeShift, setActiveShift] = useState<CashRegisterShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [isEndingShift, setIsEndingShift] = useState(false);
  
  useEffect(() => {
    const loadShift = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const storedShift = loadActiveShiftFromStorage();
        
        if (storedShift) {
          setActiveShift(storedShift);
        } else {
          const shift = await getActiveShift(user.id);
          setActiveShift(shift);
        }
      } catch (error) {
        console.error('Error loading active shift:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del turno",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShift();
  }, [user]);
  
  const startNewShift = async (initialAmount: number) => {
    if (!user) return null;
    
    setIsStartingShift(true);
    try {
      const newShift = await startShift({
        userId: user.id,
        initialAmount
      });
      
      if (newShift) {
        setActiveShift(newShift);
        toast({
          title: "Turno iniciado",
          description: `Turno iniciado con $${initialAmount.toLocaleString('es-ES')} en caja`
        });
        return newShift;
      } else {
        toast({
          title: "Error",
          description: "No se pudo iniciar el turno",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Error starting shift:', error);
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
  
  const closeCurrentShift = async (finalAmount?: number) => {
    if (!activeShift || !activeShift.id) return false;
    
    setIsEndingShift(true);
    try {
      const success = await endShift(
        activeShift.id, 
        finalAmount || activeShift.initial_amount + (activeShift.total_cash_sales || 0)
      );
      
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
      console.error('Error closing shift:', error);
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
