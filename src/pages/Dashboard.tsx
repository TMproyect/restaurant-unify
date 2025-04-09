
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useDashboardInit } from '@/hooks/use-dashboard-init';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import EnhancedDashboardCard from '@/components/dashboard/EnhancedDashboardCard';
import ActivityMonitor from '@/components/dashboard/ActivityMonitor';
import OrderDetailsDialog from '@/components/dashboard/activity/OrderDetailsDialog';
import CancellationReviewDialog from '@/components/dashboard/activity/CancellationReviewDialog';
import DiscountReviewDialog from '@/components/dashboard/activity/DiscountReviewDialog';

export default function Dashboard() {
  const { error: initError, isReady } = useDashboardInit();
  const { 
    dashboardCards, 
    activityItems,
    isLoadingStats, 
    isLoadingActivity,
    error: dataError, 
    refreshAllData,
    handleActionClick,
    // Dialog state and handlers
    selectedOrder,
    isOrderDetailsOpen,
    isCancellationReviewOpen,
    isDiscountReviewOpen,
    handleCloseOrderDetails,
    handleCloseCancellationReview,
    handleCloseDiscountReview
  } = useDashboardData();
  
  console.log('🔄 [Dashboard] Rendering dashboard with ready state:', isReady);
  
  // Si no está inicializado, esperar
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
    console.error('❌ [Dashboard] Error inicializando el dashboard:', initError);
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
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAllData}
            disabled={isLoadingStats}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Actualizar Datos
          </Button>
        </div>
        
        {/* Error display if any */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700">Error al cargar datos</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoadingStats ? (
            // Loading skeleton for cards
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
            // Actual dashboard cards
            dashboardCards.map((card, i) => (
              <EnhancedDashboardCard key={i} {...card} />
            ))
          )}
        </div>
        
        {/* Activity Monitor */}
        <ActivityMonitor
          items={activityItems}
          isLoading={isLoadingActivity}
          onRefresh={refreshAllData}
          onActionClick={handleActionClick}
        />
        
        {/* Dialogs */}
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
      </div>
    </Layout>
  );
}
