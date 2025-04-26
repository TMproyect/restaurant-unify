
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCashRegister } from '@/hooks/use-cash-register';
import { useAuth } from '@/contexts/auth/AuthContext';
import { DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OpenShiftForm = () => {
  const [initialCashAmount, setInitialCashAmount] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { startNewShift, isStartingShift, activeShift, isShiftActive } = useCashRegister();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("[OpenShiftForm] Rendering with state:", { 
    initialCashAmount, 
    displayValue, 
    isStartingShift, 
    activeShift, 
    isShiftActive,
    validationError,
    user
  });

  // Handle input focus state to show raw value
  const handleFocus = () => {
    console.log("[OpenShiftForm] Input focused, showing raw value:", initialCashAmount);
    setDisplayValue(initialCashAmount);
    // Clear any validation errors when the user focuses the field
    setValidationError(null);
  };

  // Handle input blur state to format value
  const handleBlur = () => {
    console.log("[OpenShiftForm] Input blurred, formatting value");
    if (initialCashAmount) {
      const numericValue = parseFloat(initialCashAmount);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrency(numericValue));
      }
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters except decimal point
    const inputVal = e.target.value;
    console.log("[OpenShiftForm] Raw input value:", inputVal);
    
    // Accept only digits and decimal point
    const rawValue = inputVal.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = rawValue.split('.');
    let cleanValue = parts[0];
    if (parts.length > 1) {
      cleanValue += '.' + parts[1];
    }
    
    console.log("[OpenShiftForm] Clean value after processing:", cleanValue);
    
    // Update both the internal state and display value
    setInitialCashAmount(cleanValue);
    setDisplayValue(cleanValue);
    
    // Clear validation errors when user types
    if (cleanValue) {
      setValidationError(null);
    }
  };

  const validateAmount = (): boolean => {
    console.log("[OpenShiftForm] Validating amount:", initialCashAmount);
    
    if (!initialCashAmount || initialCashAmount.trim() === '') {
      setValidationError("Ingresa un monto inicial para continuar");
      console.log("[OpenShiftForm] Validation failed: No amount provided");
      return false;
    }
    
    const amount = parseFloat(initialCashAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError("El monto inicial debe ser mayor a cero");
      console.log("[OpenShiftForm] Validation failed: Invalid amount", amount);
      return false;
    }
    
    console.log("[OpenShiftForm] Validation passed");
    return true;
  };

  const handleOpenRegister = async () => {
    console.log("[OpenShiftForm] Attempting to open register with amount:", initialCashAmount);
    
    // Validate the input first
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
      console.log("[OpenShiftForm] Parsed amount:", amount);
      console.log("[OpenShiftForm] Starting new shift with user:", user.id);
      
      const result = await startNewShift(user.id, amount);
      console.log("[OpenShiftForm] Shift start result:", result);
      
      if (!result) {
        console.error("[OpenShiftForm] Failed to start shift - result was null or false");
        toast({
          title: "Error",
          description: "No se pudo iniciar el turno. Inténtalo de nuevo.",
          variant: "destructive"
        });
      } else {
        console.log("[OpenShiftForm] Shift started successfully, showing confirmation toast");
        toast({
          title: "Éxito",
          description: `Turno iniciado con ${formatCurrency(amount)}`
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
            
            <div className="space-y-2">
              <Label htmlFor="initialCash">Monto Inicial</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="initialCash"
                  type="text" 
                  placeholder="0" 
                  className="pl-8"
                  value={displayValue}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cashier">Cajero</Label>
              <Select defaultValue="current" disabled>
                <SelectTrigger id="cashier">
                  <SelectValue placeholder="Seleccionar cajero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">{user?.name || 'Usuario Actual'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
