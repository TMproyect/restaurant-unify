
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusBadgeProps } from './types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
    case 'preparing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Preparación</Badge>;
    case 'ready':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Listo</Badge>;
    case 'delivered':
    case 'completed':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Completado</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default StatusBadge;
