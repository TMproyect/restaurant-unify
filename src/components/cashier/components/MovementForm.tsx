
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, MinusCircle, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MovementFormProps {
  onMovement: (type: 'in' | 'out', amount: number, reason: string) => void;
}

export const MovementForm: React.FC<MovementFormProps> = ({ onMovement }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const handleCashMovement = (type: 'in' | 'out') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido",
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un motivo para el movimiento",
        variant: "destructive"
      });
      return;
    }

    onMovement(type, parseFloat(amount), reason);
    setAmount('');
    setReason('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Movimientos de Efectivo</CardTitle>
        <CardDescription>
          Registra entradas y salidas de efectivo de caja
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="amount"
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0.00" 
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Input 
              id="reason"
              placeholder="Proporciona un motivo para el movimiento"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => handleCashMovement('out')}
        >
          <MinusCircle className="mr-2 h-4 w-4" />
          Salida
        </Button>
        <Button 
          className="flex-1"
          onClick={() => handleCashMovement('in')}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Entrada
        </Button>
      </CardFooter>
    </Card>
  );
};
