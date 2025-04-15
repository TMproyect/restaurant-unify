
export const DASHBOARD_ORDER_STATUSES = {
  ACTIVE: ['pending', 'preparing', 'ready', 'priority-pending', 'priority-preparing'],
  PENDING: ['pending', 'priority-pending'],
  PREPARING: ['preparing', 'priority-preparing'],
  READY: ['ready'],
  COMPLETED: ['completed', 'delivered'],
  CANCELLED: ['cancelled']
} as const;

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

