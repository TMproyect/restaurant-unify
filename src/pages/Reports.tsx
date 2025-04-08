
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    console.log('🔄 [Reports] Component mounted');
    try {
      // Simulate loading data
      const timer = setTimeout(() => {
        setIsLoading(false);
        console.log('🔄 [Reports] Data loaded successfully');
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        console.log('🔄 [Reports] Component unmounting');
      };
    } catch (error) {
      console.error('❌ [Reports] Error loading data:', error);
      toast.error('Error al cargar los reportes');
      setIsLoading(false);
    }
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reportes</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventas del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">Esta sección mostrará las ventas del mes.</p>
                <p className="text-muted-foreground mt-1">Implementación en progreso.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Productos Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">Esta sección mostrará los productos más vendidos.</p>
                <p className="text-muted-foreground mt-1">Implementación en progreso.</p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Estadísticas de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">Esta sección mostrará estadísticas detalladas de ventas.</p>
                <p className="text-muted-foreground mt-1">Implementación en progreso.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
