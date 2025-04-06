
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Package, UserRound, Utensils } from 'lucide-react';

const DashboardStats: React.FC = () => {
  console.log('🔄 [DashboardStats] Rendering dashboard stats cards');
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ventas del Día
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$18,450</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className="text-green-600 flex items-center gap-0.5">
              +20.1% <ArrowUpRight className="h-3 w-3" />
            </span> 
            desde ayer
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pedidos Activos
          </CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground mt-1">12 en cocina, 8 listos, 4 entregados</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inventario Bajo
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground mt-1">3 ingredientes críticos</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Clientes Hoy
          </CardTitle>
          <UserRound className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">142</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className="text-green-600 flex items-center gap-0.5">
              +12% <ArrowUpRight className="h-3 w-3" />
            </span> 
            desde la semana pasada
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
