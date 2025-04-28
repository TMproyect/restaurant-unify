import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useDashboardInit } from '@/hooks/use-dashboard-init';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import EnhancedDashboardCard from '@/components/dashboard/EnhancedDashboardCard';
import ActivityMonitor from '@/components/dashboard/ActivityMonitor';
import OrderDetailsDialog from '@/components/dashboard/activity/OrderDetailsDialog';
import { CancellationReviewDialog } from '@/components/dashboard/activity';
import DiscountReviewDialog from '@/components/dashboard/activity/DiscountReviewDialog';
import CancellationReasonDialog from '@/components/dashboard/activity/CancellationReasonDialog';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const { error: initError, isReady } = useDashboardInit();
  const { isAdmin } = usePermissions();
  
  const { 
    dashboardCards, 
    activityItems,
    isLoadingStats, 
    isLoadingActivity,
    error: dataError, 
    refreshAllData,
    handleActionClick,
    selectedOrder,
    isOrderDetailsOpen,
    isCancellationReviewOpen,
    isDiscountReviewOpen,
    isCancellationReasonOpen,
    handleCloseOrderDetails,
    handleCloseCancellationReview,
    handleCloseDiscountReview,
    handleCloseCancellationReason,
    handleSubmitCancellationReason
  } = useDashboardData();
  
  useEffect(() => {
    console.log('🔄 [Dashboard] Component mounted');
    setIsMounted(true);
    return () => {
      console.log('🔄 [Dashboard] Component unmounting');
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!dataError || !isMounted) return;
    
    console.error('❌ [Dashboard] Data loading error:', dataError);
    toast.error('Error al cargar datos del dashboard. Intentando reconectar...');
    
    const reconnectTimer = setTimeout(() => {
      if (isMounted) {
        console.log('🔄 [Dashboard] Attempting reconnection...');
        refreshAllData();
      }
    }, 10000);
    
    return () => clearTimeout(reconnectTimer);
  }, [dataError, isMounted, refreshAllData]);
  
  const handleActivityAction = (action: string) => {
    if (action === 'refresh-data') {
      refreshAllData();
      return;
    }
    
    handleActionClick(action);
  };
  
  if (!isReady && !initError) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
  
  if (initError) {
    console.error('❌ [Dashboard] Dashboard initialization error:', initError);
    return (
      <Layout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar el dashboard</h2>
          <p className="text-red-600">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </Layout>
    );
  }
  
  const error = dataError || initError;
  
  return (
    <Layout>
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-800">Dashboard</h1>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-700">Error al cargar datos</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoadingStats ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-full mt-4" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              dashboardCards.map((card, i) => (
                <EnhancedDashboardCard key={i} {...card} />
              ))
            )}
          </div>
          
          <ActivityMonitor
            items={activityItems}
            isLoading={isLoadingActivity}
            onActionClick={handleActivityAction}
          />
          
          <OrderDetailsDialog 
            order={selectedOrder}
            isOpen={isOrderDetailsOpen}
            onClose={handleCloseOrderDetails}
          />
          
          <CancellationReviewDialog
            order={selectedOrder}
            isOpen={isCancellationReviewOpen}
            onClose={handleCloseCancellationReview}
          />
          
          <DiscountReviewDialog
            order={selectedOrder}
            isOpen={isDiscountReviewOpen}
            onClose={handleCloseDiscountReview}
          />

          <CancellationReasonDialog
            isOpen={isCancellationReasonOpen}
            onClose={handleCloseCancellationReason}
            onSubmit={handleSubmitCancellationReason}
          />
        </div>
      </TooltipProvider>
    </Layout>
  );
}
