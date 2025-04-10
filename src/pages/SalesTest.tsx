import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import SalesMetricCard from '@/components/dashboard/SalesMetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Database, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useDailySales } from '@/hooks/use-daily-sales';

export default function SalesTest() {
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { salesTotal, transactionCount, refreshSales } = useDailySales();
  
  // Define the statuses that count as completed/paid sales (same as in the hook)
  const completedStatuses = [
    // Spanish variations
    'completado', 'completada', 'completo', 'completa',
    'terminado', 'terminada', 'terminó',
    'finalizado', 'finalizada', 'finalizó',
    'entregado', 'entregada', 'entregó',
    'pagado', 'pagada', 'pagó',
    'cobrado', 'cobrada', 'cobró',
    'listo', 'lista', 'preparado', 'preparada',
    'servido', 'servida',
    // English variations
    'completed', 'complete',
    'finished', 'done',
    'delivered', 'ready',
    'paid', 'processed',
    'served'
  ];
  
  // Obtener todas las órdenes de hoy para diagnóstico
  const fetchTodayOrders = async () => {
    setLoading(true);
    
    try {
      // Configurar fechas
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      toast.info('Fetching orders for diagnosis');
      console.log(`📊 Diagnostic: Fetching orders from ${todayStart.toISOString()} to ${todayEnd.toISOString()}`);
      
      // Obtener órdenes
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at, customer_name')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching orders:', error);
        toast.error('Error fetching orders');
        throw error;
      }
      
      console.log(`📊 Found ${data?.length || 0} orders for today`);
      
      setTodayOrders(data || []);
      // Also refresh the sales data to keep consistency
      refreshSales();
      toast.success(`Found ${data?.length || 0} orders`);
    } catch (err) {
      console.error('❌ Error getting orders:', err);
      toast.error('Error loading order data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTodayOrders();
  }, []);
  
  // Function to determine if an order status counts as a completed sale
  const isCompletedSale = (status: string) => {
    status = (status || '').toLowerCase().trim();
    return completedStatuses.some(s => status === s.toLowerCase() || status.includes(s.toLowerCase()));
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">Diagnóstico de Ventas</h1>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={fetchTodayOrders}
          >
            <RefreshCcw className="h-4 w-4" />
            Actualizar datos
          </Button>
        </div>
        
        <div className="p-6 bg-gray-50 border border-gray-100 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Ventas del Día (Componente)</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Vista del componente real de ventas diarias que aparece en el Dashboard.
          </p>
          
          <SalesMetricCard />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cálculo Manual de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">${salesTotal.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">
                    {transactionCount} transacciones
                  </span>
                </div>
                <p className="text-sm">
                  Este cálculo cuenta todas las órdenes con estados que indican venta completada.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Órdenes de Hoy ({todayOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando órdenes...</p>
            ) : todayOrders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No hay órdenes para hoy</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border">
                  <h3 className="text-sm font-medium mb-2">Estados de órdenes encontrados:</h3>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(todayOrders.map(order => order.status))].map(status => (
                      <span key={status} className="px-2 py-1 text-xs bg-gray-200 rounded">
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-auto max-h-[400px]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Cliente</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-left">Hora</th>
                        <th className="px-4 py-2 text-center">¿Es venta?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {todayOrders.map(order => {
                        const isSale = isCompletedSale(order.status);
                        return (
                          <tr key={order.id} className={`hover:bg-gray-50 ${isSale ? 'bg-green-50' : ''}`}>
                            <td className="px-4 py-2">{order.id.substring(0, 8)}...</td>
                            <td className="px-4 py-2">{order.customer_name || 'Sin nombre'}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                isSale ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right font-medium">${parseFloat(order.total || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-gray-500">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {isSale ? 
                                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> : 
                                <AlertTriangle className="h-4 w-4 text-gray-300 mx-auto" />
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 className="text-lg font-medium text-blue-800 mb-2">¿Cómo se calculan las ventas?</h2>
          <p className="text-sm text-blue-600 mb-4">
            El componente SalesMetricCard cuenta como "ventas" las órdenes que tienen cualquiera de estos estados:
          </p>
          <div className="bg-white rounded-lg p-4 border border-blue-100 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {completedStatuses.map(status => (
                <span key={status} className="px-2 py-1 bg-green-100 text-green-800 rounded">
                  {status}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
