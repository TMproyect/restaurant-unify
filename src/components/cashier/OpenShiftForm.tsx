
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCashRegister } from '@/hooks/use-cash-register';
import { useAuth } from '@/contexts/auth/AuthContext';
import { DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OpenShiftForm = () => {
  const [initialCashAmount, setInitialCashAmount] = useState('');
  const { startNewShift, isStartingShift } = useCashRegister();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleOpenRegister = async () => {
    if (!initialCashAmount || parseFloat(initialCashAmount) < 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto inicial válido",
        variant: "destructive"
      });
      return;
    }
    
    await startNewShift(parseFloat(initialCashAmount));
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
                  type="number" 
                  min="0" 
                  step="0.01"
                  placeholder="0.00" 
                  className="pl-8"
                  value={initialCashAmount}
                  onChange={(e) => setInitialCashAmount(e.target.value)}
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
