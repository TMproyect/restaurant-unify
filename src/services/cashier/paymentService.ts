
import { supabase } from "@/integrations/supabase/client";
import { PaymentData, PaymentState } from "@/components/cashier/payment/types";
import { toast } from "sonner";

interface PaymentRecord {
  order_id: string;
  payment_method: string;
  amount: number;
  tip_amount: number | null;
  created_at: string;
}

export const registerPayment = async (paymentData: PaymentData): Promise<boolean> => {
  try {
    console.log('Registering payment:', paymentData);
    
    // For now, since we don't have a payments table yet, we'll just log the payment
    // But in a real application, you would save this to the database
    
    // Convert payment data to database format
    const paymentRecords: PaymentRecord[] = paymentData.payments.map(payment => ({
      order_id: paymentData.orderId,
      payment_method: payment.method,
      amount: payment.amount,
      tip_amount: payment.tipAmount || null,
      created_at: new Date().toISOString()
    }));

    // Log the payment records - this would be saved to a database in real implementation
    console.log('Payment records to save:', paymentRecords);
    
    // Return success for now
    return true;
  } catch (error) {
    console.error('Error registering payment:', error);
    toast.error('Error al registrar el pago');
    return false;
  }
};

export const getPaymentsByOrderId = async (orderId: string): Promise<PaymentState[]> => {
  try {
    // In a real implementation, this would fetch from the database
    console.log(`Fetching payments for order ${orderId}`);
    
    // Return empty array for now
    return [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    toast.error('Error al obtener los pagos');
    return [];
  }
};
