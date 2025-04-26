
export const calculateSubtotal = (items: any[]) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const calculateDiscount = (subtotal: number, discountType: 'percent' | 'amount', discount: number) => {
  if (discountType === 'percent') {
    return subtotal * (discount / 100);
  }
  return discount;
};

export const calculateTax = (subtotal: number, discountValue: number) => {
  return (subtotal - discountValue) * 0.16; // 16% tax
};

export const calculateTip = (subtotal: number, tipType: 'percent' | 'amount', tipAmount: number) => {
  if (tipType === 'percent') {
    return subtotal * (tipAmount / 100);
  }
  return tipAmount;
};

export const calculateTotal = (
  subtotal: number,
  discountValue: number,
  tax: number,
  tipValue: number
) => {
  return subtotal - discountValue + tax + tipValue;
};

// Calculate the correct denomination for returning change
export const calculateChangeDenominations = (changeAmount: number): Record<number, number> => {
  const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
  let remainingChange = changeAmount;
  const result: Record<number, number> = {};

  denominations.forEach(denom => {
    if (remainingChange >= denom) {
      const count = Math.floor(remainingChange / denom);
      result[denom] = count;
      remainingChange = parseFloat((remainingChange - count * denom).toFixed(2));
    }
  });

  return result;
};

// Format currency with proper decimal places
export const formatCurrencyValue = (value: number): string => {
  return value.toFixed(2);
};
