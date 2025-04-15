
export const DASHBOARD_ORDER_STATUSES = {
  ACTIVE: ['pending', 'preparing', 'ready', 'priority-pending', 'priority-preparing'] as string[],
  PENDING: ['pending', 'priority-pending'] as string[],
  PREPARING: ['preparing', 'priority-preparing'] as string[],
  READY: ['ready'] as string[],
  COMPLETED: ['completed', 'delivered'] as string[],
  CANCELLED: ['cancelled'] as string[]
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
