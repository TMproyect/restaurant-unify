
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashRegister } from '@/hooks/use-cash-register';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
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
  } = useShiftForm();

  const { isStartingShift, startNewShift } = useCashRegister();
  const { user } = useAuth();

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
      return;
    }
    
    if (!user?.id) {
      console.error("[OpenShiftForm] No user ID available");
      return;
    }
    
    const amount = parseFloat(initialCashAmount);
    await startNewShift(amount);
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
              <Alert variant="destructive">
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
