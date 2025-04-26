
import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { useCurrencyInput } from '@/hooks/use-currency-input';
import { cn } from '@/lib/utils';

interface AmountInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  onEnterPress?: () => void;
  autoFocus?: boolean;
  readOnly?: boolean;
  className?: string;
}

export const AmountInput = ({
  id,
  label,
  value,
  onChange,
  onEnterPress,
  autoFocus,
  readOnly,
  className
}: AmountInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    value: numericValue,
    displayValue,
    onChange: handleInputChange
  } = useCurrencyInput(value);

  // Sync external value changes with internal state
  useEffect(() => {
    if (value !== numericValue) {
      handleInputChange(value.toString());
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          id={id}
          type="text"
          className={cn("pl-8 text-right font-mono text-lg", className)}
          value={displayValue}
          onChange={(e) => {
            const newValue = handleInputChange(e.target.value);
            onChange(newValue);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnterPress) {
              onEnterPress();
            }
          }}
          readOnly={readOnly}
          inputMode="numeric"
        />
      </div>
    </div>
  );
};
