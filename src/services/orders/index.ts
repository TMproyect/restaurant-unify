
console.log('🔄 [orders/index] Loading orders module');

export * from './orderQueries';
// Explicitly exclude getOrderByExternalId from orderCreation to avoid duplicate exports
export { 
  createOrder
} from './orderCreation';
export * from './orderUpdates';
export * from './orderSubscriptions';

console.log('✅ [orders/index] Orders module loaded successfully');
