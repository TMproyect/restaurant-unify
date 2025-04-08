
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import OrdersList from './OrdersList';
import LowStockAlert from '../inventory/LowStockAlert';
import DashboardStats from './DashboardStats';

interface DashboardContentProps {
  showOrders?: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ showOrders }) => {
  console.log('🔄 [DashboardContent] Rendering dashboard content', showOrders ? 'showing orders' : 'showing sales');
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Lista de pedidos recientes - 4 columnas */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{showOrders ? 'Pedidos Recientes' : 'Ventas Recientes'}</CardTitle>
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
            <LowStockAlert 
              onViewInventory={() => console.log('Ver todo el inventario')} 
              compact={true}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardContent;
