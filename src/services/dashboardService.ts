
// This file is kept just to provide backward compatibility 
// for any imports that might still use it.
// It re-exports from the new modular structure

export { 
  getDashboardStats,
  generateDashboardCards,
  subscribeToDashboardUpdates,
  getActivityMonitor,
  prioritizeOrder,
  checkSystemStatus,
  updateOrderStatus
} from './dashboardService/index';
