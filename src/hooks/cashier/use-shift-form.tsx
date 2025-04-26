
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';

export const useShiftForm = () => {
  const [initialCashAmount, setInitialCashAmount] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFocus = () => {
    console.log("[ShiftForm] Input focused, showing raw value:", initialCashAmount);
    setDisplayValue(initialCashAmount);
    setValidationError(null);
  };

  const handleBlur = () => {
    console.log("[ShiftForm] Input blurred, formatting value");
    if (initialCashAmount) {
      const numericValue = parseFloat(initialCashAmount);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatCurrency(numericValue));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    console.log("[ShiftForm] Raw input value:", inputVal);
    
    const rawValue = inputVal.replace(/[^\d.]/g, '');
    const parts = rawValue.split('.');
    let cleanValue = parts[0];
    if (parts.length > 1) {
      cleanValue += '.' + parts[1];
    }
    
    console.log("[ShiftForm] Clean value after processing:", cleanValue);
    
    setInitialCashAmount(cleanValue);
    setDisplayValue(cleanValue);
    
    if (cleanValue) {
      setValidationError(null);
    }
  };

  const validateAmount = (): boolean => {
    console.log("[ShiftForm] Validating amount:", initialCashAmount);
    
    if (!initialCashAmount || initialCashAmount.trim() === '') {
      setValidationError("Ingresa un monto inicial para continuar");
      console.log("[ShiftForm] Validation failed: No amount provided");
      return false;
    }
    
    const amount = parseFloat(initialCashAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError("El monto inicial debe ser mayor a cero");
      console.log("[ShiftForm] Validation failed: Invalid amount", amount);
      return false;
    }
    
    console.log("[ShiftForm] Validation passed");
    return true;
  };

  return {
    initialCashAmount,
    displayValue,
    validationError,
    setValidationError,
    handleFocus,
    handleBlur,
    handleInputChange,
    validateAmount
  };
};
