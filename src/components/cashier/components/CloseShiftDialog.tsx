
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Lock, Loader2, AlertCircle } from 'lucide-react';
import { CashRegisterShift } from '@/services/cashier';
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
  const [displayValue, setDisplayValue] = React.useState('');
  
  // Format value when component mounts or finalAmount changes
  useEffect(() => {
    console.log("[CloseShiftDialog] Initial amount set:", finalAmount);
    if (finalAmount) {
      setDisplayValue(formatCurrency(parseFloat(finalAmount)));
    } else {
      setDisplayValue('');
    }
  }, [finalAmount]);

  // Handle input focus to show raw value
  const handleFocus = () => {
    console.log("[CloseShiftDialog] Input focused, showing raw value:", finalAmount);
    setDisplayValue(finalAmount);
  };

  // Handle input blur to format value
  const handleBlur = () => {
    console.log("[CloseShiftDialog] Input blurred, formatting value");
    if (finalAmount) {
      const numericValue = parseFloat(finalAmount);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrency(numericValue));
      }
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters except decimal point
    const inputVal = e.target.value;
    console.log("[CloseShiftDialog] Raw input value:", inputVal);
    
    // Accept only digits and decimal point
    const rawValue = inputVal.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = rawValue.split('.');
    let cleanValue = parts[0];
    if (parts.length > 1) {
      cleanValue += '.' + parts[1];
    }
    
    console.log("[CloseShiftDialog] Clean value after processing:", cleanValue);
    
    // Update both the internal state and display value
    onFinalAmountChange(cleanValue);
    setDisplayValue(cleanValue);
  };

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
                type="text" 
                min="0" 
                className="pl-8"
                value={displayValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                inputMode="decimal"
                placeholder={formatCurrency(expectedAmount)}
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
