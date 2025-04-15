
type Order = {
  total?: number;
  customer_name?: string;
};

export const calculateSalesMetrics = (todaySales: Order[] | null, yesterdaySales: Order[] | null) => {
  // Calculate today's metrics
  const dailyTotal = todaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const transactionCount = todaySales?.length || 0;
  const averageTicket = transactionCount > 0 ? dailyTotal / transactionCount : 0;
  
  // Calculate yesterday totals for comparison
  const yesterdayTotal = yesterdaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const changePercentage = yesterdayTotal > 0 
    ? ((dailyTotal - yesterdayTotal) / yesterdayTotal) * 100 
    : 0;
  
  return {
    dailyTotal,
    transactionCount,
    averageTicket,
    changePercentage
  };
};

export const calculatePopularItems = (orderItemsData: any[] | null) => {
  const itemCountMap = new Map();
  
  orderItemsData?.forEach(item => {
    const itemId = item.menu_item_id || item.name;
    const count = itemCountMap.get(itemId) || { name: item.name, quantity: 0, id: itemId };
    count.quantity += item.quantity;
    itemCountMap.set(itemId, count);
  });
  
  return Array.from(itemCountMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(item => ({
      name: item.name,
      quantity: item.quantity,
      id: item.id
    }));
};
