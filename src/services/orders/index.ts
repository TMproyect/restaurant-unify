
console.log('🔄 [orders/index] Loading orders module');

// Import and re-export everything from orderQueries
export * from './orderQueries';

// Explicitly export only createOrder from orderCreation to avoid duplicating getOrderByExternalId
export { 
  createOrder
} from './orderCreation';

// Export everything else
export * from './orderUpdates';
export * from './orderSubscriptions';

console.log('✅ [orders/index] Orders module loaded successfully');
