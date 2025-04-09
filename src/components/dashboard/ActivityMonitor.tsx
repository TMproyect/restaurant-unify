
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Filter,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onActionClick: (action: string) => void;
}

const getStatusBadge = (status: string) => {
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

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ 
  items, 
  isLoading, 
  onRefresh, 
  onActionClick 
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const filters = [
    { id: 'delayed', label: 'Órdenes con Retraso', icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: 'cancelled', label: 'Cancelaciones', icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { id: 'discounts', label: 'Con Descuentos', icon: <DollarSign className="h-4 w-4 mr-2" /> }
  ];
  
  const filterItems = (items: ActivityMonitorItem[]) => {
    // First filter by tab
    let filtered = items;
    if (activeTab === 'active') {
      filtered = items.filter(item => 
        item.status === 'pending' || 
        item.status === 'preparing' || 
        item.status === 'ready'
      );
    } else if (activeTab === 'completed') {
      filtered = items.filter(item => 
        item.status === 'delivered' || 
        item.status === 'completed' || 
        item.status === 'cancelled'
      );
    } else if (activeTab === 'exceptions') {
      filtered = items.filter(item => 
        item.isDelayed || 
        item.hasCancellation || 
        item.hasDiscount
      );
    }
    
    // Then apply additional filters
    if (activeFilter === 'delayed') {
      filtered = filtered.filter(item => item.isDelayed);
    } else if (activeFilter === 'cancelled') {
      filtered = filtered.filter(item => item.hasCancellation);
    } else if (activeFilter === 'discounts') {
      filtered = filtered.filter(item => item.hasDiscount);
    }
    
    return filtered;
  };
  
  const filteredItems = filterItems(items);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Monitor de Actividad</CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-1" /> Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveFilter(null)}>
                  Mostrar Todo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {filters.map(filter => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={activeFilter === filter.id ? "bg-muted" : ""}
                  >
                    {filter.icon} {filter.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" className="h-8" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab}>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No hay datos que mostrar con los filtros actuales</p>
              </div>
            ) : (
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
                      // Determine if row should be highlighted
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
                              {getStatusBadge(item.status)}
                              
                              {/* Exception indicators */}
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
                            <div className="flex gap-1">
                              {item.actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant={
                                    action.type === 'danger' ? 'destructive' :
                                    action.type === 'warning' ? 'secondary' : 'outline'
                                  }
                                  className="h-7 text-xs"
                                  onClick={() => onActionClick(action.action)}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ActivityMonitor;
