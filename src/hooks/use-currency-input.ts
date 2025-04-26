
import { useState } from 'react';

export const useCurrencyInput = (initialValue: number = 0) => {
  const [numericValue, setNumericValue] = useState(initialValue);
  
  const formatToDisplay = (value: number): string => {
    // Use Colombian locale for currency formatting with period as thousand separator
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseFromInput = (displayValue: string): number => {
    // Remove all non-digit characters
    const cleanValue = displayValue.replace(/[^\d]/g, '');
    return parseInt(cleanValue, 10) || 0;
  };

  const handleChange = (inputValue: string) => {
    const newValue = parseFromInput(inputValue);
    setNumericValue(newValue);
    return newValue;
  };

  return {
    value: numericValue,
    displayValue: formatToDisplay(numericValue),
    onChange: handleChange,
    setValue: setNumericValue
  };
};
