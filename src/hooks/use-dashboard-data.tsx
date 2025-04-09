
import { useCallback, useEffect } from 'react';
import { useStats } from './dashboard/use-stats';
import { useActivity } from './dashboard/use-activity';
import { useDialogs } from './dashboard/use-dialogs';
import { toast } from 'sonner';

export function useDashboardData() {
  const { 
    dashboardCards, 
    isLoadingStats, 
    error: statsError,
    fetchDashboardData 
  } = useStats();
  
  const { 
    activityItems, 
    isLoadingActivity, 
    error: activityError,
    fetchActivityData
  } = useActivity();
  
  const {
    selectedOrder,
    isOrderDetailsOpen,
    isCancellationReviewOpen,
    isDiscountReviewOpen,
    isCancellationReasonOpen,
    orderIdToCancel,
    handleCloseOrderDetails,
    handleCloseCancellationReview,
    handleCloseDiscountReview,
    handleCloseCancellationReason,
    handleSubmitCancellationReason,
    setSelectedOrder,
    setIsOrderDetailsOpen,
    setIsCancellationReviewOpen,
    setIsDiscountReviewOpen,
    setOrderIdToCancel,
    setIsCancellationReasonOpen
  } = useDialogs();
  
  // Add detailed logging to track component lifecycle
  useEffect(() => {
    console.log('🔄 [useDashboardData] Hook initialized');
    console.log('🔄 [useDashboardData] Initial loading states:', { isLoadingStats, isLoadingActivity });
    
    return () => {
      console.log('🔄 [useDashboardData] Hook cleanup');
    };
  }, [isLoadingStats, isLoadingActivity]);
  
  // Combine errors
  const error = statsError || activityError;
  
  // Simplified refresh function without refs or complex locking
  const refreshAllData = useCallback(() => {
    console.log('🔄 [useDashboardData] refreshAllData called - refreshing all dashboard data');
    
    try {
      // Use Promise.all but with proper error handling
      Promise.all([
        fetchDashboardData().catch(err => {
          console.error('❌ [useDashboardData] Error refreshing dashboard stats:', err);
        }),
        fetchActivityData().catch(err => {
          console.error('❌ [useDashboardData] Error refreshing activity data:', err);
        })
      ]).catch(err => {
        console.error('❌ [useDashboardData] Error in Promise.all:', err);
      });
    } catch (err) {
      console.error('❌ [useDashboardData] Unexpected error in refreshAllData:', err);
    }
  }, [fetchDashboardData, fetchActivityData]);
  
  // Handle action clicks from the activity monitor
  const handleActionClick = useCallback(async (action: string) => {
    console.log('🔄 [useDashboardData] Action clicked:', action);
    
    const [actionType, id] = action.split(':');
    
    // Find the order in the activity items
    const order = activityItems.find(item => item.id === id) || null;
    
    switch (actionType) {
      case 'view':
        // Set the selected order and open the details dialog
        setSelectedOrder(order);
        setIsOrderDetailsOpen(true);
        break;
        
      case 'prioritize':
        // This is handled by useActivity hook
        import('./dashboard/use-activity').then(module => {
          module.prioritizeOrderAction(id, refreshAllData);
        }).catch(err => {
          console.error('❌ [useDashboardData] Error importing prioritizeOrderAction:', err);
          toast.error('Error al priorizar la orden');
        });
        break;
        
      case 'review-cancel':
        // Set the selected order and open the cancellation review dialog
        setSelectedOrder(order);
        setIsCancellationReviewOpen(true);
        break;
        
      case 'review-discount':
        // Set the selected order and open the discount review dialog
        setSelectedOrder(order);
        setIsDiscountReviewOpen(true);
        break;
        
      case 'cancel':
        // Open the cancellation reason dialog and store the order ID
        setOrderIdToCancel(id);
        setIsCancellationReasonOpen(true);
        break;
        
      default:
        console.warn('❌ [useDashboardData] Unknown action type:', actionType);
        toast.error(`Acción desconocida: ${actionType}`);
    }
  }, [
    activityItems, 
    setSelectedOrder, 
    setIsOrderDetailsOpen, 
    setIsCancellationReviewOpen,
    setIsDiscountReviewOpen,
    setOrderIdToCancel,
    setIsCancellationReasonOpen,
    refreshAllData
  ]);

  return {
    dashboardCards,
    activityItems,
    isLoadingStats,
    isLoadingActivity,
    error,
    refreshAllData,
    handleActionClick,
    // Dialog state and handlers
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
  };
}
