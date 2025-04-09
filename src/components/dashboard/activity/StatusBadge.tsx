
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusBadgeProps } from './types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isDelayed = false }) => {
  let color = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = status;
  
  switch (status) {
    case 'pending':
    case 'pendiente':
      color = isDelayed 
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-blue-100 text-blue-800 border-blue-300';
      label = isDelayed ? 'Retrasado' : 'Pendiente';
      break;
    case 'priority-pending':
      color = 'bg-amber-100 text-amber-800 border-amber-300';
      label = 'Prioritario';
      break;
    case 'preparing':
    case 'preparando':
    case 'en preparación':
      color = 'bg-purple-100 text-purple-800 border-purple-300';
      label = 'Preparando';
      break;
    case 'priority-preparing':
      color = 'bg-orange-100 text-orange-800 border-orange-300';
      label = 'Prep. Prio.';
      break;
    case 'ready':
    case 'listo':
    case 'lista':
      color = 'bg-green-100 text-green-800 border-green-300';
      label = 'Listo';
      break;
    case 'delivered':
    case 'entregado':
    case 'entregada':
      color = 'bg-teal-100 text-teal-800 border-teal-300';
      label = 'Entregado';
      break;
    case 'completed':
    case 'completado':
    case 'completada':
      color = 'bg-green-100 text-green-800 border-green-300';
      label = 'Completado';
      break;
    case 'cancelled':
    case 'cancelado':
    case 'cancelada':
      color = 'bg-red-100 text-red-800 border-red-300';
      label = 'Cancelado';
      break;
  }
  
  return (
    <Badge variant="outline" className={`${color}`}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
