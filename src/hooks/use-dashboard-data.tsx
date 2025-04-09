
import { useCallback, useEffect, useRef } from 'react';
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
  
  // Use ref to track if update is in progress
  const isUpdatingRef = useRef(false);
  
  // Combine errors
  const error = statsError || activityError;
  
  // Throttled refresh function to prevent excessive updates
  const refreshAllData = useCallback(() => {
    if (isUpdatingRef.current) {
      console.log('🔄 [useDashboardData] Update already in progress, skipping...');
      return;
    }
    
    console.log('🔄 [useDashboardData] Refreshing all dashboard data');
    isUpdatingRef.current = true;
    
    // Use setTimeout to stagger updates and reduce UI thrashing
    setTimeout(() => {
      fetchDashboardData();
      
      setTimeout(() => {
        fetchActivityData();
        isUpdatingRef.current = false;
      }, 100);
    }, 0);
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
