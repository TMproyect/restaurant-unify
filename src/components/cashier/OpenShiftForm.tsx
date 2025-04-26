
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashRegister } from '@/hooks/use-cash-register';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CashAmountInput } from './components/CashAmountInput';
import { CashierSelector } from './components/CashierSelector';
import { useShiftForm } from '@/hooks/cashier/use-shift-form';

const OpenShiftForm = () => {
  const {
    initialCashAmount,
    displayValue,
    validationError,
    handleFocus,
    handleBlur,
    handleInputChange,
    validateAmount,
    setValidationError
  } = useShiftForm();

  const { startNewShift, isStartingShift } = useCashRegister();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("[OpenShiftForm] Rendering with state:", { 
    initialCashAmount, 
    displayValue,
    isStartingShift,
    validationError,
    user
  });

  const handleOpenRegister = async () => {
    console.log("[OpenShiftForm] Attempting to open register with amount:", initialCashAmount);
    
    if (!validateAmount()) {
      console.log("[OpenShiftForm] Validation failed");
      toast({
        title: "Error",
        description: validationError || "Ingresa un monto inicial válido",
        variant: "destructive"
      });
      return;
    }
    
    if (!user?.id) {
      console.error("[OpenShiftForm] No user ID available");
      toast({
        title: "Error",
        description: "No se pudo determinar el usuario actual. Por favor, inicia sesión de nuevo.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const amount = parseFloat(initialCashAmount);
      console.log("[OpenShiftForm] Starting new shift with user:", user.id);
      
      const result = await startNewShift(user.id, amount);
      
      if (result) {
        console.log("[OpenShiftForm] Shift started successfully");
        toast({
          title: "Éxito",
          description: `Turno iniciado con ${amount.toLocaleString('es-ES', { style: 'currency', currency: 'COP' })}`
        });
      } else {
        console.error("[OpenShiftForm] Failed to start shift - result was null or false");
        toast({
          title: "Error",
          description: "No se pudo iniciar el turno. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[OpenShiftForm] Error al iniciar turno:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar el turno",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Apertura de Caja</CardTitle>
          <CardDescription>
            Ingresa el monto inicial para iniciar el turno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            <CashAmountInput 
              displayValue={displayValue}
              onInputChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            
            <CashierSelector cashierName={user?.name || ''} />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleOpenRegister}
            disabled={isStartingShift}
          >
            {isStartingShift ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              'Iniciar Turno'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OpenShiftForm;
