
export const DASHBOARD_ORDER_STATUSES = {
  ACTIVE: ['pending', 'preparing', 'ready', 'priority-pending', 'priority-preparing'] as string[],
  PENDING: ['pending', 'priority-pending'] as string[],
  PREPARING: ['preparing', 'priority-preparing'] as string[],
  READY: ['ready'] as string[],
  COMPLETED: ['completed', 'delivered'] as string[],
  CANCELLED: ['cancelled'] as string[]
};

export const isActiveStatus = (status: string): boolean => {
  return DASHBOARD_ORDER_STATUSES.ACTIVE.includes(status.toLowerCase());
};

export const isPendingStatus = (status: string): boolean => {
  return DASHBOARD_ORDER_STATUSES.PENDING.includes(status.toLowerCase());
};

export const isPreparingStatus = (status: string): boolean => {
  return DASHBOARD_ORDER_STATUSES.PREPARING.includes(status.toLowerCase());
};

export const isReadyStatus = (status: string): boolean => {
  return DASHBOARD_ORDER_STATUSES.READY.includes(status.toLowerCase());
};
