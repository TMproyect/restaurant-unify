import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Package, UserRound, Utensils } from 'lucide-react';
import AlertsBanner from '@/components/dashboard/AlertsBanner';
import OrdersList from '@/components/dashboard/OrdersList';
import InventoryAlert from '@/components/dashboard/InventoryAlert';
import UpgradeToAdmin from '@/components/dashboard/UpgradeToAdmin';
import { useAuth } from '@/contexts/auth/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {/* Banner de actualización a Admin */}
        <UpgradeToAdmin />
        
        {/* Alertas y notificaciones */}
        <AlertsBanner />
        
        {/* Stats Cards */}
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
      </div>
    </Layout>
  );
};

export default Dashboard;
