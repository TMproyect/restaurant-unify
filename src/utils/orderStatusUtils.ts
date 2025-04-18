
/**
 * Utilidades para normalizar y trabajar con estados de órdenes
 */

/**
 * Tipos de estado de orden normalizados
 */
export type NormalizedOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

/**
 * Normaliza el estado de la orden para asegurar consistencia en toda la aplicación
 * @param status Estado a normalizar
 * @returns Estado normalizado
 */
export const normalizeOrderStatus = (status: string): NormalizedOrderStatus => {
  // Verificar si el estado es nulo o indefinido
  if (!status) return 'pending';
  
  // Convertir todo a minúsculas para facilitar la comparación
  const normalizedStatus = status.toLowerCase().trim();
  
  // IMPORTANTE: Manejar casos con prefijo 'priority-'
  const hasPriorityPrefix = normalizedStatus.startsWith('priority-');
  const statusWithoutPrefix = hasPriorityPrefix 
    ? normalizedStatus.substring('priority-'.length) 
    : normalizedStatus;
  
  // Mapeo más preciso de estados a categorías estándar
  if (statusWithoutPrefix === 'pending' || 
      statusWithoutPrefix === 'pendiente' || 
      statusWithoutPrefix.includes('pend') || 
      statusWithoutPrefix.includes('nueva') ||
      statusWithoutPrefix.includes('nuevo')) {
    return 'pending';
  } else if (statusWithoutPrefix === 'preparing' || 
             statusWithoutPrefix === 'preparando' || 
             statusWithoutPrefix.includes('prepar') || 
             statusWithoutPrefix.includes('en prep') || 
             statusWithoutPrefix.includes('cocinando')) {
    return 'preparing';
  } else if (statusWithoutPrefix === 'ready' || 
             statusWithoutPrefix === 'listo' || 
             statusWithoutPrefix === 'lista' || 
             statusWithoutPrefix.includes('list') || 
             statusWithoutPrefix.includes('ready') ||
             statusWithoutPrefix.includes('complet')) {
    return 'ready';
  } else if (statusWithoutPrefix === 'delivered' || 
             statusWithoutPrefix === 'entregado' || 
             statusWithoutPrefix === 'entregada' || 
             statusWithoutPrefix.includes('entrega') || 
             statusWithoutPrefix.includes('deliver')) {
    return 'delivered';
  } else if (statusWithoutPrefix === 'cancelled' || 
             statusWithoutPrefix === 'cancelado' || 
             statusWithoutPrefix === 'cancelada' || 
             statusWithoutPrefix.includes('cancel')) {
    return 'cancelled';
  }
  
  console.log(`⚠️ [orderStatusUtils] Estado no reconocido: "${status}", usando valor original`);
  // Si no coincide con ninguno de los anteriores, devolver 'pending' como valor predeterminado seguro
  return 'pending';
};

/**
 * Obtiene etiqueta de estado en español para mostrar al usuario
 */
export const getStatusLabel = (status: NormalizedOrderStatus): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'preparing': return 'En preparación';
    case 'ready': return 'Listo';
    case 'delivered': return 'Entregado';
    case 'cancelled': return 'Cancelado';
    default: return 'Pendiente';
  }
};

/**
 * Constantes para mapeo de estados UI a DB
 */
export const UI_STATUS_MAP: Record<NormalizedOrderStatus, string> = {
  pending: 'pendiente',
  preparing: 'preparando',
  ready: 'listo',
  delivered: 'entregado',
  cancelled: 'cancelado'
};

/**
 * Constantes para mapeo de estados DB a UI
 */
export const DB_TO_UI_STATUS_MAP: Record<string, NormalizedOrderStatus> = {
  'pending': 'pending',
  'pendiente': 'pending',
  'nueva': 'pending',
  'nuevo': 'pending',
  'priority-pending': 'pending',
  'priority-pendiente': 'pending',
  'preparing': 'preparing',
  'preparando': 'preparing',
  'en preparación': 'preparing',
  'cocinando': 'preparing',
  'priority-preparing': 'preparing',
  'priority-preparando': 'preparing',
  'ready': 'ready',
  'listo': 'ready',
  'lista': 'ready',
  'delivered': 'delivered',
  'entregado': 'delivered',
  'entregada': 'delivered',
  'cancelled': 'cancelled',
  'cancelado': 'cancelled',
  'cancelada': 'cancelled'
};

/**
 * Obtiene los estados de base de datos que corresponden a un estado de UI
 * @param uiStatus Estado de la interfaz de usuario
 * @returns Array de posibles estados en la base de datos
 */
export const getDBStatusesFromUIStatus = (uiStatus: NormalizedOrderStatus): string[] => {
  let dbStatuses: string[] = [];
  
  if (uiStatus === 'pending') {
    dbStatuses = ['pending', 'Pendiente', 'pendiente', 'nueva', 'nuevo', 'Nueva', 'priority-pending', 'priority-pendiente'];
  } else if (uiStatus === 'preparing') {
    dbStatuses = ['preparing', 'Preparando', 'preparando', 'En preparación', 'en preparación', 'cocinando', 'Cocinando', 'priority-preparing', 'priority-preparando'];
  } else if (uiStatus === 'ready') {
    dbStatuses = ['ready', 'Listo', 'listo', 'Lista', 'lista', 'completado', 'Completado'];
  } else if (uiStatus === 'delivered') {
    dbStatuses = ['delivered', 'Entregada', 'entregada', 'Entregado', 'entregado'];
  } else if (uiStatus === 'cancelled') {
    dbStatuses = ['cancelled', 'Cancelada', 'cancelada', 'Cancelado', 'cancelado'];
  }
  
  return dbStatuses;
};

/**
 * Verifica si un estado DB pertenece a un estado UI específico
 * @param dbStatus Estado en la base de datos
 * @param uiStatus Estado en la interfaz
 * @returns true si el estado DB corresponde al estado UI
 */
export const isDbStatusMatchingUiStatus = (dbStatus: string, uiStatus: NormalizedOrderStatus): boolean => {
  if (!dbStatus) return false;
  
  const normalizedDbStatus = dbStatus.toLowerCase().trim();
  const dbStatuses = getDBStatusesFromUIStatus(uiStatus);
  
  return dbStatuses.some(status => 
    status.toLowerCase().trim() === normalizedDbStatus || 
    normalizedDbStatus.includes(status.toLowerCase().trim())
  );
};

/**
 * Determina los estados de orden que se consideran "completados"
 * para propósitos de ventas y contabilidad.
 * @returns Array de posibles estados de orden completada
 */
export const getCompletedOrderStatuses = (): string[] => {
  return [
    // Español - variaciones más comunes
    'completado', 'completada', 'completo', 'completa',
    'terminado', 'terminada', 'terminó',
    'finalizado', 'finalizada', 'finalizó',
    'entregado', 'entregada', 'entregó',
    'pagado', 'pagada', 'pagó',
    'cobrado', 'cobrada', 'cobró',
    'listo', 'lista', 'preparado', 'preparada',
    'servido', 'servida',
    
    // Inglés - variaciones más comunes
    'completed', 'complete',
    'finished', 'done',
    'delivered', 'ready',
    'paid', 'processed', 
    'served'
  ];
};

/**
 * Verifica si un estado de orden se considera "completado"
 * @param status Estado a verificar
 * @returns true si el estado corresponde a una orden completada
 */
export const isCompletedOrderStatus = (status: string): boolean => {
  if (!status) return false;
  
  const normalizedStatus = status.toLowerCase().trim();
  const completedStatuses = getCompletedOrderStatuses();
  
  return completedStatuses.some(completedStatus => 
    normalizedStatus === completedStatus.toLowerCase() || 
    normalizedStatus.includes(completedStatus.toLowerCase())
  );
};
