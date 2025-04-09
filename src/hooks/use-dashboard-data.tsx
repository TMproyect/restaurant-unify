
import { useCallback } from 'react';
import { useStats } from './dashboard/use-stats';
import { useActivity } from './dashboard/use-activity';
import { useDialogs } from './dashboard/use-dialogs';

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
  
  // Combine errors
  const error = statsError || activityError;
  
  // Refresh all data
  const refreshAllData = useCallback(() => {
    fetchDashboardData();
    fetchActivityData();
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
        import('sonner').then(module => {
          module.toast.error(`Acción desconocida: ${actionType}`);
        });
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
