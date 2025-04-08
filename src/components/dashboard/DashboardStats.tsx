
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, Package, UserRound, Utensils } from 'lucide-react';

const DashboardStats: React.FC = () => {
  console.log('🔄 [DashboardStats] Rendering dashboard stats cards');
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">
            Ventas del Día
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">$18,450</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className="text-green-600 flex items-center gap-0.5">
              +20.1% <ArrowUpRight className="h-3 w-3" />
            </span> 
            desde ayer
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-800">
            Pedidos Activos
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
            <Utensils className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">24</div>
          <p className="text-xs text-muted-foreground mt-1">12 en cocina, 8 listos, 4 entregados</p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-800">
            Inventario Bajo
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">7</div>
          <p className="text-xs text-muted-foreground mt-1">3 ingredientes críticos</p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-indigo-50 to-violet-50 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-indigo-800">
            Clientes Hoy
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
            <UserRound className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">142</div>
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
