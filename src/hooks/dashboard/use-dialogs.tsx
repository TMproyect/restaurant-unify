
import { useState, useCallback } from 'react';
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { updateOrderStatus } from '@/services/dashboardService';
import { toast } from 'sonner';

export function useDialogs() {
  // Dialog state
  const [selectedOrder, setSelectedOrder] = useState<ActivityMonitorItem | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isCancellationReviewOpen, setIsCancellationReviewOpen] = useState(false);
  const [isDiscountReviewOpen, setIsDiscountReviewOpen] = useState(false);
  const [isCancellationReasonOpen, setIsCancellationReasonOpen] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | null>(null);

  // Close dialog handlers
  const handleCloseOrderDetails = useCallback(() => {
    setIsOrderDetailsOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleCloseCancellationReview = useCallback(() => {
    setIsCancellationReviewOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleCloseDiscountReview = useCallback(() => {
    setIsDiscountReviewOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleCloseCancellationReason = useCallback(() => {
    setIsCancellationReasonOpen(false);
    setOrderIdToCancel(null);
  }, []);

  const handleSubmitCancellationReason = useCallback(async (reason: string) => {
    if (!orderIdToCancel) return;
    
    try {
      // Update order status with cancellation reason
      const success = await updateOrderStatus(orderIdToCancel, 'cancelled', reason);
      
      if (success) {
        toast.success(`Orden ${orderIdToCancel.substring(0, 6)} cancelada`);
        // The parent component should refresh data - we don't do that here
      } else {
        toast.error(`Error al cancelar la orden ${orderIdToCancel.substring(0, 6)}`);
      }
    } catch (error) {
      console.error('❌ [useDialogs] Error cancelling order:', error);
      toast.error('Error al cancelar la orden');
    } finally {
      setIsCancellationReasonOpen(false);
      setOrderIdToCancel(null);
    }
  }, [orderIdToCancel]);

  return {
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
  };
}
