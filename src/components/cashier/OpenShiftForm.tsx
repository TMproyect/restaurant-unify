
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
  const { startNewShift, isStartingShift } = useCashRegister();
  const { user } = useAuth();
  const { toast } = useToast();

  // Actualizar el displayValue cuando cambia el initialCashAmount
  useEffect(() => {
    if (initialCashAmount === '') {
      setDisplayValue('');
      return;
    }
    
    try {
      const numericValue = parseFloat(initialCashAmount);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrency(numericValue));
      }
    } catch (error) {
      console.error('Error formateando número:', error);
      setDisplayValue(initialCashAmount);
    }
  }, [initialCashAmount]);

  // Manejador de cambio para la entrada numérica
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir dígitos y punto decimal, eliminar otros caracteres
    let value = e.target.value.replace(/[^\d.]/g, '');
    
    // Prevenir múltiples puntos decimales
    const decimalPoints = value.match(/\./g);
    if (decimalPoints && decimalPoints.length > 1) {
      value = value.slice(0, value.lastIndexOf('.'));
    }
    
    // Actualizar el estado con el valor limpio
    setInitialCashAmount(value);
  };

  // Manejador para cuando el input pierde el foco
  const handleBlur = () => {
    if (initialCashAmount) {
      const numericValue = parseFloat(initialCashAmount);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrency(numericValue));
      }
    }
  };

  // Manejador para cuando el input obtiene el foco
  const handleFocus = () => {
    // Mostrar el valor sin formato cuando el campo recibe el foco
    setDisplayValue(initialCashAmount);
  };

  const handleOpenRegister = async () => {
    if (!initialCashAmount || parseFloat(initialCashAmount) < 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto inicial válido",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await startNewShift(parseFloat(initialCashAmount));
      if (!result) {
        toast({
          title: "Error",
          description: "No se pudo iniciar el turno. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al iniciar turno:', error);
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
