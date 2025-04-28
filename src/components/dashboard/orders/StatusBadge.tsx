
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<string, { label: string, classes: string }> = {
    pending: {
      label: 'Pendiente',
      classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    preparing: {
      label: 'En preparación',
      classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    ready: {
      label: 'Listo',
      classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    delivered: {
      label: 'Entregado',
      classes: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    },
    cancelled: {
      label: 'Cancelado',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
    archived: {
      label: 'Archivado',
      classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
  };

  const { label, classes } = statusConfig[status] || {
    label: status,
    classes: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', classes)}>
      {label}
    </span>
  );
};

export default StatusBadge;
