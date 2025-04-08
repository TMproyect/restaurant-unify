
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import OrdersList from './OrdersList';
import DashboardStats from './DashboardStats';
import { toast } from 'sonner';

interface DashboardContentProps {
  showOrders?: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ showOrders }) => {
  console.log('🔄 [DashboardContent] Rendering dashboard content', showOrders ? 'showing orders' : 'showing sales');
  
  // Add error boundary effect
  useEffect(() => {
    try {
      console.log('🔄 [DashboardContent] Component mounted successfully');
      console.log('🔍 [DashboardContent] Inventory feature has been completely removed, dashboard now focused only on orders and sales');
    } catch (error) {
      console.error('❌ [DashboardContent] Error in component initialization:', error);
      toast.error('Error al cargar el contenido del dashboard');
    }
    
    return () => {
      console.log('🔄 [DashboardContent] Component unmounting');
    };
  }, []);
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Lista de pedidos recientes - 7 columnas (ahora ocupando todo el ancho) */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>{showOrders ? 'Pedidos Recientes' : 'Ventas Recientes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersList />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardContent;
