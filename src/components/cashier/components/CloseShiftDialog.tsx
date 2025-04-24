
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Lock, Loader2, AlertCircle } from 'lucide-react';
import { CashRegisterShift } from '@/services/cashierService';
import { formatCurrency } from '@/utils/formatters';

interface CloseShiftDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (finalAmount: string) => Promise<void>;
  isClosing: boolean;
  shift: CashRegisterShift;
  finalAmount: string;
  onFinalAmountChange: (value: string) => void;
}

export const CloseShiftDialog: React.FC<CloseShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  isClosing,
  shift,
  finalAmount,
  onFinalAmountChange,
}) => {
  const expectedAmount = shift.initial_amount + (shift.total_cash_sales || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar Turno de Caja</DialogTitle>
          <DialogDescription>
            Para cerrar el turno, ingresa el monto final de efectivo en caja.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="finalCashAmount">Monto Final en Efectivo</Label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="finalCashAmount"
                type="number" 
                min="0" 
                step="0.01"
                placeholder={formatCurrency(expectedAmount)} 
                className="pl-8"
                value={finalAmount}
                onChange={(e) => onFinalAmountChange(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monto esperado en caja: {formatCurrency(expectedAmount)}
            </p>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Al cerrar el turno se generará un reporte final y no podrás procesar más ventas hasta iniciar un nuevo turno.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => onClose(finalAmount)}
            disabled={isClosing}
          >
            {isClosing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Cerrar Turno
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
