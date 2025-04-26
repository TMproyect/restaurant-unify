
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
  tipType: 'percent' | 'amount';
  currentPayment: PaymentState;
  payments: PaymentState[];
}

const usePaymentCalculations = ({
  items,
  discount,
  discountType,
  tipAmount,
  tipType,
  currentPayment,
  payments
}: UsePaymentCalculationsProps) => {
  const [change, setChange] = useState(0);

  const subtotal = calculateSubtotal(items);
  const discountValue = calculateDiscount(subtotal, discountType, discount);
  const tax = calculateTax(subtotal, discountValue);
  const tipValue = calculateTip(subtotal, tipType, tipAmount);
  const total = calculateTotal(subtotal, discountValue, tax, tipValue);

  const calculatePendingAmount = () => {
    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, total - paidAmount);
  };

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
    total,
    change,
    pendingAmount: calculatePendingAmount()
  };
};

export default usePaymentCalculations;
