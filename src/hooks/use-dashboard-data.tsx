
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
  
  // Use a ref to track if initial data has been loaded
  const initialLoadDoneRef = useRef(false);
  
  // Add detailed logging to track component lifecycle
  useEffect(() => {
    console.log('🔄 [useDashboardData] Hook initialized');
    
    // Only fetch data once when the component mounts
    if (!initialLoadDoneRef.current) {
      console.log('🔄 [useDashboardData] Performing initial data load');
      
      // Load both data sets in parallel but with proper error handling
      Promise.all([
        fetchDashboardData().catch(err => {
          console.error('❌ [useDashboardData] Error in initial dashboard stats load:', err);
        }),
        fetchActivityData().catch(err => {
          console.error('❌ [useDashboardData] Error in initial activity data load:', err);
        })
      ]).then(() => {
        console.log('✅ [useDashboardData] Initial data loading complete');
        initialLoadDoneRef.current = true;
      }).catch(err => {
        console.error('❌ [useDashboardData] Unexpected error in initial data load:', err);
      });
    }
    
    return () => {
      console.log('🔄 [useDashboardData] Hook cleanup');
    };
  }, [fetchDashboardData, fetchActivityData]);
  
  // Combine errors
  const error = statsError || activityError;
  
  // Simplified refresh function
  const refreshAllData = useCallback(() => {
    console.log('🔄 [useDashboardData] Manual refresh requested');
    
    // Reset the initial load flag to force a reload
    initialLoadDoneRef.current = false;
    
    // Use Promise.all but with proper error handling
    Promise.all([
      fetchDashboardData().catch(err => {
        console.error('❌ [useDashboardData] Error refreshing dashboard stats:', err);
      }),
      fetchActivityData().catch(err => {
        console.error('❌ [useDashboardData] Error refreshing activity data:', err);
      })
    ]).then(() => {
      console.log('✅ [useDashboardData] Manual refresh complete');
      initialLoadDoneRef.current = true;
    }).catch(err => {
      console.error('❌ [useDashboardData] Error in manual refresh:', err);
    });
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
        // Import dynamically to avoid circular dependencies
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
