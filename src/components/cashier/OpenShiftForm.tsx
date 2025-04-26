
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCashRegister } from '@/hooks/use-cash-register';
import { useAuth } from '@/contexts/auth/AuthContext';
import { DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';

const OpenShiftForm = () => {
  const [initialCashAmount, setInitialCashAmount] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const { startNewShift, isStartingShift, activeShift, isShiftActive } = useCashRegister();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("[OpenShiftForm] Current state:", { 
    initialCashAmount, 
    displayValue, 
    isStartingShift, 
    activeShift, 
    isShiftActive 
  });

  // Handle input focus state to show raw value
  const handleFocus = () => {
    console.log("[OpenShiftForm] Input focused, showing raw value:", initialCashAmount);
    setDisplayValue(initialCashAmount);
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
    const rawValue = e.target.value.replace(/[^\d.]/g, '');
    
    console.log("[OpenShiftForm] Raw input value:", rawValue);
    
    // Handle decimal points - allow only one
    const parts = rawValue.split('.');
    let cleanValue = parts[0];
    if (parts.length > 1) {
      cleanValue += '.' + parts[1];
    }
    
    console.log("[OpenShiftForm] Clean value after processing:", cleanValue);
    
    // Update both the internal state and display value
    setInitialCashAmount(cleanValue);
    setDisplayValue(cleanValue);
  };

  const handleOpenRegister = async () => {
    console.log("[OpenShiftForm] Attempting to open register with amount:", initialCashAmount);
    
    if (!initialCashAmount || parseFloat(initialCashAmount) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto inicial válido (mayor a cero)",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("[OpenShiftForm] Starting new shift...");
      const result = await startNewShift(parseFloat(initialCashAmount));
      console.log("[OpenShiftForm] Shift start result:", result);
      
      if (!result) {
        toast({
          title: "Error",
          description: "No se pudo iniciar el turno. Inténtalo de nuevo.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Éxito",
          description: `Turno iniciado con ${formatCurrency(parseFloat(initialCashAmount))}`,
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
