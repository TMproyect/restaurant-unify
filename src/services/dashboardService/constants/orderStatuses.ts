
export const DASHBOARD_ORDER_STATUSES = {
  // En el dashboard, Active no incluye ready (solo pending y preparing)
  ACTIVE: ['pending', 'preparing', 'priority-pending', 'priority-preparing'] as string[],
  PENDING: ['pending', 'priority-pending', 'pendiente', 'nueva', 'nuevo'] as string[],
  PREPARING: ['preparing', 'priority-preparing', 'preparando', 'en preparación', 'cocinando'] as string[],
  READY: ['ready', 'listo', 'lista', 'preparado', 'preparada'] as string[],
  COMPLETED: ['completed', 'delivered', 'entregado', 'entregada', 'completado', 'completada', 'pagado'] as string[],
  CANCELLED: ['cancelled', 'cancelado', 'cancelada'] as string[]
};

export const isActiveStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  // CORRECCIÓN: Active no incluye ready
  return ['pending', 'preparing', 'priority-pending', 'priority-preparing'].some(s => 
    normalizedStatus === s || 
    normalizedStatus.includes(s)
  );
};

export const isPendingStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return DASHBOARD_ORDER_STATUSES.PENDING.some(s => 
    normalizedStatus === s || 
    (normalizedStatus.includes(s) && !normalizedStatus.includes('preparing'))
  );
};

export const isPreparingStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return DASHBOARD_ORDER_STATUSES.PREPARING.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
  );
};

export const isReadyStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return DASHBOARD_ORDER_STATUSES.READY.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
  );
};

export const isCompletedStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  // Para el Dashboard, consideramos ready como completado
  return DASHBOARD_ORDER_STATUSES.COMPLETED.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
  ) || isReadyStatus(status); // Incluir ready en completados
};

export const isCancelledStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return DASHBOARD_ORDER_STATUSES.CANCELLED.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
  );
};
