
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import SalesMetricCard from '@/components/dashboard/SalesMetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Database, Calendar } from 'lucide-react';
import { useSalesMetric } from '@/hooks/use-sales-metric';
import { supabase } from '@/integrations/supabase/client';

export default function SalesTest() {
  const { refetchSalesData, rawSalesData } = useSalesMetric();
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Obtener todas las órdenes de hoy para diagnóstico
  const fetchTodayOrders = async () => {
    setLoading(true);
    
    try {
      // Configurar fechas
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      
      console.log(`📊 [SalesTest] Obteniendo órdenes: ${todayStart.toISOString()} a ${tomorrowStart.toISOString()}`);
      
      // Obtener órdenes
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at, customer_name')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', tomorrowStart.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [SalesTest] Error:', error);
        throw error;
      }
      
      console.log(`📊 [SalesTest] Órdenes encontradas: ${data?.length || 0}`);
      setTodayOrders(data || []);
    } catch (err) {
      console.error('❌ [SalesTest] Error obteniendo órdenes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTodayOrders();
  }, []);
  
  const refreshAll = () => {
    refetchSalesData();
    fetchTodayOrders();
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">Diagnóstico de Ventas</h1>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={refreshAll}
          >
            <RefreshCcw className="h-4 w-4" />
            Actualizar todo
          </Button>
        </div>
        
        <div className="p-6 bg-gray-50 border border-gray-100 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Ventas del Día (Componente)</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Vista del componente real de ventas diarias que aparece en el Dashboard.
          </p>
          
          <SalesMetricCard />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Datos crudos de ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rawSalesData ? (
                <pre className="bg-gray-50 p-4 rounded border text-xs overflow-auto max-h-[300px]">
                  {JSON.stringify(rawSalesData, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">Cargando datos...</p>
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
                  
                  <div className="overflow-auto max-h-[250px]">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1 text-left">ID</th>
                          <th className="px-2 py-1 text-left">Estado</th>
                          <th className="px-2 py-1 text-right">Total</th>
                          <th className="px-2 py-1 text-left">Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {todayOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-2 py-1">{order.id.substring(0, 6)}...</td>
                            <td className="px-2 py-1">
                              <span className={`px-1.5 py-0.5 rounded ${
                                ['completado','completada','entregado','pagado','listo','ready','delivered'].some(
                                  s => order.status?.toLowerCase().includes(s)
                                ) ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-2 py-1 text-right">${parseFloat(order.total).toFixed(2)}</td>
                            <td className="px-2 py-1">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Proceso de cálculo</h2>
          <p className="text-sm text-blue-600 mb-4">
            Revisa la consola del navegador para ver logs detallados del proceso de cálculo.
          </p>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal pl-5">
            <li>Se obtienen <strong>TODAS</strong> las órdenes de hoy sin filtrar por estado inicialmente</li>
            <li>Se normalizan y verifican los estados para identificar ventas completadas:
              <div className="bg-white p-2 mt-1 rounded text-xs">
                Estados considerados como venta completada: 'completed', 'completado', 'completada',
                'entregado', 'entregada', 'delivered', 'pagado', 'pagada', 'paid',
                'listo', 'lista', 'ready', 'finalizado', 'finalizada', 'finished'
              </div>
            </li>
            <li>Se procesan detalladamente los totales de cada orden</li>
            <li>Se calculan estadísticas para hoy y ayer para comparación</li>
            <li>Se genera la tarjeta de dashboard con información de diagnóstico mejorada</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
