
import React from 'react';
import Layout from '@/components/layout/Layout';
import SalesMetricCard from '@/components/dashboard/SalesMetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useSalesMetric } from '@/hooks/use-sales-metric';

export default function SalesTest() {
  const { refetchSalesData, rawSalesData } = useSalesMetric();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">Prueba de Métricas de Ventas</h1>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={() => refetchSalesData()}
          >
            <RefreshCcw className="h-4 w-4" />
            Actualizar datos
          </Button>
        </div>
        
        <div className="p-6 bg-gray-50 border border-gray-100 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Ventas del Día (Componente aislado)</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Este es un componente aislado para la métrica de ventas del día, diseñado para facilitar la depuración.
          </p>
          
          <SalesMetricCard />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Datos crudos de ventas</CardTitle>
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
        
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Proceso de cálculo</h2>
          <p className="text-sm text-blue-600 mb-4">
            Revisa la consola del navegador para ver logs detallados del proceso de carga de datos.
          </p>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal pl-5">
            <li>Se obtiene información de <strong>TODAS</strong> las órdenes de hoy</li>
            <li>Se filtran órdenes con status que incluyan cualquiera de estos términos:
              <div className="bg-white p-2 mt-1 rounded text-xs">
                'completed', 'completado', 'complete', 'completo', 'completa', 'completada',
                'delivered', 'entregado', 'entregada', 'deliver', 'entrega',
                'paid', 'pagado', 'pagada', 'pago', 'pay',
                'listo', 'lista', 'ready', 'done',
                'finalizado', 'finalizada', 'finish',
                'closed', 'cerrado', 'cerrada'
              </div>
            </li>
            <li>Se calcula el total de ventas del día</li>
            <li>Se obtienen las ventas de ayer para comparación</li>
            <li>Se muestra el resultado en la tarjeta</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
