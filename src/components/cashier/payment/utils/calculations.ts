
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
