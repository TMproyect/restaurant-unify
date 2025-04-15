
export const DASHBOARD_ORDER_STATUSES = {
  ACTIVE: ['pending', 'preparing', 'ready', 'priority-pending', 'priority-preparing'] as string[],
  PENDING: ['pending', 'priority-pending', 'pendiente', 'nueva', 'nuevo'] as string[],
  PREPARING: ['preparing', 'priority-preparing', 'preparando', 'en preparación', 'cocinando'] as string[],
  READY: ['ready', 'listo', 'lista', 'preparado', 'preparada'] as string[],
  COMPLETED: ['completed', 'delivered', 'entregado', 'entregada', 'completado', 'completada', 'pagado'] as string[],
  CANCELLED: ['cancelled', 'cancelado', 'cancelada'] as string[]
};

export const isActiveStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return DASHBOARD_ORDER_STATUSES.ACTIVE.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
  );
};

export const isPendingStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return DASHBOARD_ORDER_STATUSES.PENDING.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
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
  return DASHBOARD_ORDER_STATUSES.COMPLETED.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
  );
};

export const isCancelledStatus = (status: string): boolean => {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return DASHBOARD_ORDER_STATUSES.CANCELLED.some(s => 
    normalizedStatus === s || normalizedStatus.includes(s)
  );
};
