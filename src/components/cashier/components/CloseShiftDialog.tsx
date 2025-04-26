import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Loader2 } from 'lucide-react';
import { CashRegisterShift } from '@/services/cashier';
import { formatCurrency } from '@/utils/formatters';

interface CloseShiftDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
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
  // Calculate expected amount
  const expectedAmount = shift?.initial_amount + (shift?.total_cash_sales || 0);
  
  // Format the amount for display
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^\d.]/g, '');
    onFinalAmountChange(value);
  };

  // Handle input focus to show raw value
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show raw number without formatting when focused
    onFinalAmountChange(finalAmount);
  };

  // Handle input blur to format with thousand separators
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numValue = parseFloat(finalAmount);
    if (!isNaN(numValue)) {
      // Keep the raw value in state but display formatted
      e.target.value = formatCurrency(numValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cierre de Turno</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Monto Inicial:</span>
                <span className="text-sm">{formatCurrency(shift?.initial_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Ventas en Efectivo:</span>
                <span className="text-sm">{formatCurrency(shift?.total_cash_sales || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Monto Esperado:</span>
                <span className="text-sm font-semibold">{formatCurrency(expectedAmount)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="finalAmount" className="text-sm font-medium">
                Monto Final en Caja
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="finalAmount"
                  type="text"
                  className="pl-8"
                  value={finalAmount}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={formatCurrency(expectedAmount)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isClosing}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onClose}
            disabled={isClosing}
          >
            {isClosing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando...
              </>
            ) : (
              'Cerrar Turno'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
