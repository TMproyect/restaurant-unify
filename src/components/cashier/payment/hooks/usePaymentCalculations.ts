
import { useState, useEffect } from 'react';
import { PaymentState } from '../types';
import { 
  calculateSubtotal, 
  calculateDiscount, 
  calculateTax, 
  calculateTip, 
  calculateTotal 
} from '../utils/calculations';

interface UsePaymentCalculationsProps {
  items: any[];
  discount: number;
  discountType: 'percent' | 'amount';
  tipAmount: number;
  tipPercentage: number;
  currentPayment: PaymentState;
  payments: PaymentState[];
}

const usePaymentCalculations = ({
  items,
  discount,
  discountType,
  tipAmount,
  tipPercentage,
  currentPayment,
  payments
}: UsePaymentCalculationsProps) => {
  const [change, setChange] = useState(0);

  const subtotal = calculateSubtotal(items);
  const discountValue = calculateDiscount(subtotal, discountType, discount);
  const tax = calculateTax(subtotal, discountValue);
  
  // Calculate tip based on tipAmount and tipPercentage
  let calculatedTip = 0;
  if (tipAmount > 0) {
    calculatedTip = tipAmount;
  } else if (tipPercentage > 0) {
    calculatedTip = (subtotal * tipPercentage) / 100;
  }

  // Add tips from all previous payments
  const previousTips = payments.reduce((sum, payment) => {
    return sum + (payment.tipAmount || 0);
  }, 0);
  
  const tipValue = calculatedTip + previousTips;
  
  const total = calculateTotal(subtotal, discountValue, tax, tipValue);

  const calculatePendingAmount = () => {
    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, total - paidAmount);
  };

  const pendingAmount = calculatePendingAmount();

  useEffect(() => {
    if (currentPayment.method === 'cash' && currentPayment.cashReceived) {
      const cashReceived = currentPayment.cashReceived || 0;
      const amount = currentPayment.amount || 0;
      setChange(cashReceived >= amount ? cashReceived - amount : 0);
    } else {
      setChange(0);
    }
  }, [currentPayment]);

  return {
    subtotal,
    discountValue,
    tax,
    tipValue,
    calculatedTip,
    total,
    change,
    pendingAmount
  };
};

export default usePaymentCalculations;
