
// Export all dashboard service functions
export { getDashboardStats } from './stats';
export { generateDashboardCards } from './dashboardCards';
export { subscribeToDashboardUpdates } from './dashboardRealtime';
export { getActivityMonitor, prioritizeOrder } from './activityMonitor';
export { checkSystemStatus } from './systemStatus';

// Export updateOrderStatus from orders
export { updateOrderStatus } from '../orders/orderUpdates';
