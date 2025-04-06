
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Package, UserRound, Utensils } from 'lucide-react';
import AlertsBanner from '@/components/dashboard/AlertsBanner';
import OrdersList from '@/components/dashboard/OrdersList';
import InventoryAlert from '@/components/dashboard/InventoryAlert';
import UpgradeToAdmin from '@/components/dashboard/UpgradeToAdmin';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  console.log('🔄 [Dashboard] Component rendering');
  
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  // Add detailed error handling and initial loading state
  useEffect(() => {
    console.log('🔄 [Dashboard] useEffect running for initialization');
    
    // Simple initialization to make sure components can mount safely
    try {
      console.log("✅ [Dashboard] Starting initialization...");
      
      // Check if all required services are available
      console.log("🔍 [Dashboard] Checking auth context...");
      console.log("🔍 [Dashboard] User from auth context:", user);
      
      // Set a small timeout to ensure any async initializations can complete
      const timer = setTimeout(() => {
        console.log("✅ [Dashboard] Initialization completed successfully");
        setIsReady(true);
      }, 500);
      
      return () => {
        console.log("🔄 [Dashboard] Cleaning up initialization timer");
        clearTimeout(timer);
      };
    } catch (err) {
      console.error("❌ [Dashboard] Error initializing dashboard:", err);
      console.error("❌ [Dashboard] Error stack:", err instanceof Error ? err.stack : 'No stack trace');
      setError("Error al cargar el dashboard. Por favor, recargue la página.");
      
      toast({
        title: "Error en el Dashboard",
        description: "Hubo un problema al inicializar el dashboard. Intente recargar la página.",
        variant: "destructive"
      });
    }
  }, []);

  // Log render decisions
  if (error) {
    console.log('🔄 [Dashboard] Rendering error state:', error);
  } else if (!isReady) {
    console.log('🔄 [Dashboard] Rendering loading state');
  } else {
    console.log('🔄 [Dashboard] Rendering normal dashboard');
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
              onClick={() => {
                console.log('🔄 [Dashboard] Reload button clicked');
                window.location.reload();
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show loading state until ready
  if (!isReady) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Normal dashboard render
  console.log('🔄 [Dashboard] Rendering complete dashboard UI');
  
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
