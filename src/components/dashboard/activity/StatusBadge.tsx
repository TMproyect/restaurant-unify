
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock } from 'lucide-react';
import { StatusBadgeProps } from './types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isDelayed = false }) => {
  let color = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = status;
  let tooltipText = '';
  
  switch (status) {
    case 'pending':
    case 'pendiente':
      color = isDelayed 
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-blue-100 text-blue-800 border-blue-300';
      label = isDelayed ? 'Pendiente' : 'Pendiente';
      tooltipText = isDelayed ? 'Esta orden está retrasada y requiere atención inmediata' : 'Orden pendiente de preparación';
      break;
    case 'priority-pending':
      color = 'bg-amber-100 text-amber-800 border-amber-300';
      label = 'Prioritario';
      tooltipText = 'Orden pendiente marcada como prioritaria';
      break;
    case 'preparing':
    case 'preparando':
    case 'en preparación':
      color = isDelayed
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-purple-100 text-purple-800 border-purple-300';
      label = 'Preparando';
      tooltipText = isDelayed ? 'Esta preparación está retrasada y requiere atención' : 'Orden en proceso de preparación';
      break;
    case 'priority-preparing':
      color = 'bg-orange-100 text-orange-800 border-orange-300';
      label = 'Prep. Prioritaria';
      tooltipText = 'Orden en preparación marcada como prioritaria';
      break;
    case 'ready':
    case 'listo':
    case 'lista':
      color = 'bg-green-100 text-green-800 border-green-300';
      label = 'Listo';
      tooltipText = 'Orden lista para entregar';
      break;
    case 'delivered':
    case 'entregado':
    case 'entregada':
      color = 'bg-teal-100 text-teal-800 border-teal-300';
      label = 'Entregado';
      tooltipText = 'Orden entregada al cliente';
      break;
    case 'completed':
    case 'completado':
    case 'completada':
      color = 'bg-green-100 text-green-800 border-green-300';
      label = 'Completado';
      tooltipText = 'Orden completada y pagada';
      break;
    case 'cancelled':
    case 'cancelado':
    case 'cancelada':
      color = 'bg-red-100 text-red-800 border-red-300';
      label = 'Cancelado';
      tooltipText = 'Orden cancelada';
      break;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">
            <Badge variant="outline" className={`${color} flex items-center gap-1`}>
              {isDelayed && <Clock className="h-3 w-3" />}
              {label}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusBadge;
