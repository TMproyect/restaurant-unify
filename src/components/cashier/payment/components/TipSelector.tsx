
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Percent } from 'lucide-react';

interface TipSelectorProps {
  subtotal: number;
  currentTipAmount: number;
  currentTipPercentage: number;
  onApplyTip: (amount: number, percentage: number) => void;
}

const TipSelector: React.FC<TipSelectorProps> = ({
  subtotal,
  currentTipAmount,
  currentTipPercentage,
  onApplyTip
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customPercentage, setCustomPercentage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'percentage' | 'amount'>('percentage');

  // Common tip percentages
  const tipPercentages = [10, 15, 20];

  const handleSelectPercentage = (percentage: number) => {
    const amount = (subtotal * percentage) / 100;
    onApplyTip(amount, percentage);
  };

  const handleApplyCustomPercentage = () => {
    const percentage = parseFloat(customPercentage);
    if (!isNaN(percentage) && percentage >= 0) {
      const amount = (subtotal * percentage) / 100;
      onApplyTip(amount, percentage);
    }
  };

  const handleApplyCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount >= 0) {
      const percentage = subtotal > 0 ? (amount / subtotal) * 100 : 0;
      onApplyTip(amount, percentage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center mb-4">
        <Button
          variant={activeTab === 'percentage' ? 'default' : 'outline'}
          onClick={() => setActiveTab('percentage')}
          className="rounded-r-none"
        >
          Porcentaje
        </Button>
        <Button
          variant={activeTab === 'amount' ? 'default' : 'outline'}
          onClick={() => setActiveTab('amount')}
          className="rounded-l-none"
        >
          Monto Fijo
        </Button>
      </div>

      {activeTab === 'percentage' ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            {tipPercentages.map(percentage => (
              <Button
                key={percentage}
                variant={currentTipPercentage === percentage ? "default" : "outline"}
                onClick={() => handleSelectPercentage(percentage)}
                className="h-16"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold">{percentage}%</span>
                  <span className="text-xs">${((subtotal * percentage) / 100).toFixed(2)}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-4">
            <Label htmlFor="customPercentage">Porcentaje personalizado</Label>
            <div className="flex mt-1">
              <div className="relative flex-1">
                <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customPercentage"
                  type="number"
                  min="0"
                  step="1"
                  className="pl-8"
                  placeholder="0"
                  value={customPercentage}
                  onChange={(e) => setCustomPercentage(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleApplyCustomPercentage}
                disabled={!customPercentage || parseFloat(customPercentage) <= 0}
                className="ml-2"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <Label htmlFor="customAmount">Monto de propina</Label>
          <div className="flex mt-1">
            <div className="relative flex-1">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="customAmount"
                type="number"
                min="0"
                step="1"
                className="pl-8"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleApplyCustomAmount}
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              className="ml-2"
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 bg-secondary/20 rounded-lg mt-4">
        <div className="flex justify-between">
          <span className="font-medium">Propina actual:</span>
          <span className="font-bold">${currentTipAmount.toFixed(2)} ({currentTipPercentage.toFixed(1)}%)</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-medium">Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => onApplyTip(0, 0)}
      >
        Eliminar propina
      </Button>
    </div>
  );
};

export default TipSelector;
