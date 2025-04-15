
export const getUniqueCustomers = (orders: any[] | null) => {
  if (!orders) return new Set<string>();
  
  const uniqueCustomers = new Set<string>();
  orders.forEach(order => {
    if (order.customer_name) {
      uniqueCustomers.add(order.customer_name.toLowerCase());
    }
  });
  
  return uniqueCustomers;
};
