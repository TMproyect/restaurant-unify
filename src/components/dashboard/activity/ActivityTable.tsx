
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import ActionButtons from './ActionButtons';
import { ActivityTableProps } from './types';

const ActivityTable: React.FC<ActivityTableProps> = ({ filteredItems, onActionClick }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map(item => {
            const rowClass = cn(
              "transition-colors hover:bg-gray-50",
              {
                "bg-red-50": item.hasCancellation,
                "bg-yellow-50": item.isDelayed && !item.hasCancellation,
                "bg-blue-50": item.hasDiscount && !item.isDelayed && !item.hasCancellation
              }
            );
            
            return (
              <TableRow key={item.id} className={rowClass}>
                <TableCell>
                  <div className="font-medium">#{item.id.substring(0, 6)}</div>
                  <div className="text-xs text-gray-500">
                    {item.itemsCount} items
                  </div>
                </TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={item.status} />
                    
                    <div className="flex gap-1 mt-1">
                      {item.isDelayed && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 px-1.5 py-0">
                                <Clock className="h-3 w-3 text-yellow-700 mr-1" />
                                <span className="text-[10px] text-yellow-700">
                                  {item.timeElapsed}m
                                </span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Retrasado por {item.timeElapsed} minutos</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {item.hasDiscount && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-blue-50 border-blue-200 px-1.5 py-0">
                                <DollarSign className="h-3 w-3 text-blue-700 mr-1" />
                                <span className="text-[10px] text-blue-700">
                                  {item.discountPercentage}%
                                </span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Descuento de {item.discountPercentage}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">${item.total.toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <ActionButtons 
                    actions={item.actions} 
                    onActionClick={onActionClick} 
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivityTable;
