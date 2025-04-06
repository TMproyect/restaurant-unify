
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import OrdersList from './OrdersList';
import InventoryAlert from './InventoryAlert';
import DashboardStats from './DashboardStats';

const DashboardContent: React.FC = () => {
  console.log('🔄 [DashboardContent] Rendering dashboard content');
  
  return (
    <>
      <DashboardStats />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Lista de pedidos recientes - 4 columnas */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersList />
          </CardContent>
        </Card>
        
        {/* Alertas de inventario - 3 columnas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Alertas de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryAlert />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardContent;
