
/**
 * Utilidades para normalizar y trabajar con estados de órdenes
 */

/**
 * Normaliza el estado de la orden para asegurar consistencia en toda la aplicación
 * @param status Estado a normalizar
 * @returns Estado normalizado
 */
export const normalizeOrderStatus = (status: string): string => {
  // Verificar si el estado es nulo o indefinido
  if (!status) return 'pending';
  
  // Convertir todo a minúsculas para facilitar la comparación
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes('pend')) {
    return 'pending';
  } else if (normalizedStatus.includes('prepar')) {
    return 'preparing';
  } else if (normalizedStatus.includes('list') || normalizedStatus.includes('ready')) {
    return 'ready';
  } else if (normalizedStatus.includes('entrega') || normalizedStatus.includes('deliver')) {
    return 'delivered';
  } else if (normalizedStatus.includes('cancel')) {
    return 'cancelled';
  }
  
  // Si no coincide con ninguno de los anteriores, devolver el original
  return status;
};

/**
 * Obtiene los estados de base de datos que corresponden a un estado de UI
 * @param uiStatus Estado de la interfaz de usuario
 * @returns Array de posibles estados en la base de datos
 */
export const getDBStatusesFromUIStatus = (uiStatus: 'pending' | 'preparing' | 'ready'): string[] => {
  let dbStatuses: string[] = [];
  
  if (uiStatus === 'pending') {
    dbStatuses = ['pending', 'Pendiente', 'pendiente'];
  } else if (uiStatus === 'preparing') {
    dbStatuses = ['preparing', 'Preparando', 'preparando', 'En preparación', 'en preparación'];
  } else if (uiStatus === 'ready') {
    dbStatuses = ['ready', 'Listo', 'listo', 'delivered', 'Entregada', 'entregada'];
  }
  
  return dbStatuses;
};
