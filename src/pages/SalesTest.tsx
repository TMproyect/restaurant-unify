
import React from 'react';
import Layout from '@/components/layout/Layout';
import SalesMetricCard from '@/components/dashboard/SalesMetricCard';

export default function SalesTest() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">Prueba de Métricas de Ventas</h1>
        </div>
        
        <div className="p-6 bg-gray-50 border border-gray-100 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Ventas del Día (Componente aislado)</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Este es un componente aislado para la métrica de ventas del día, diseñado para facilitar la depuración.
          </p>
          
          <SalesMetricCard />
        </div>
        
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Información de Depuración</h2>
          <p className="text-sm text-blue-600 mb-4">
            Revisa la consola del navegador para ver logs detallados del proceso de carga de datos.
          </p>
          <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-[300px]">
            {`
1. Se obtiene información del endpoint /orders
2. Se filtran órdenes con status: ['completed', 'delivered', 'completado', 'entregado', 'paid', 'pagado', 'listo', 'lista', 'ready']
3. Se calcula el total de ventas del día
4. Se obtienen las ventas de ayer para comparación
5. Se muestra el resultado en la tarjeta
            `}
          </pre>
        </div>
      </div>
    </Layout>
  );
}
