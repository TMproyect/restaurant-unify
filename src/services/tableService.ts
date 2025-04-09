
// This file is kept for backward compatibility
// All functionality is now in the tables directory
import * as tableService from './tables';

// Re-export everything
export const {
  // Table queries
  getRestaurantTables,
  getTableById,
  getTableZones,
  getZoneById,
  
  // Table mutations
  addRestaurantTable,
  updateRestaurantTable,
  deleteRestaurantTable,
  addTableZone,
  updateTableZone,
  deleteTableZone,
  
  // Realtime subscriptions
  subscribeToTableChanges,
  subscribeToZoneChanges
} = tableService;
