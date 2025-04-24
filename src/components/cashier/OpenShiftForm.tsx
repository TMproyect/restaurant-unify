
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
      console.error('Error formatting number:', error);
      setDisplayValue(initialCashAmount);
    }
  }, [initialCashAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setInitialCashAmount(value);
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
