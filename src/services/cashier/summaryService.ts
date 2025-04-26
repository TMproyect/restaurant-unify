
import { toast } from 'sonner';
import { DailySummaryData } from '@/components/cashier/payment/types';

// Storage key constant
const SUMMARY_STORAGE_KEY = 'cashier_daily_summary';

// Helper function to calculate average ticket
const calculateAverageTicket = (totalSales: number, orderCount: number): number => {
  if (orderCount === 0) return 0;
  // Round to 2 decimal places for consistency
  return Number((totalSales / orderCount).toFixed(2));
};

export const getDailySummary = async (): Promise<DailySummaryData | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Load from localStorage
    const storedData = localStorage.getItem(SUMMARY_STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Check if the stored summary is for today
      if (parsedData.date === today) {
        return {
          ...parsedData,
          averageTicket: calculateAverageTicket(parsedData.totalSales, parsedData.orderCount)
        };
      }
    }
    
    // If no data or not today's data, create a new summary
    const newSummary: DailySummaryData = {
      date: today,
      totalSales: 0,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      orderCount: 0,
      averageTicket: 0
    };
    
    // Store in localStorage
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(newSummary));
    
    return newSummary;
  } catch (error) {
    console.error('Error getting daily summary:', error);
    toast.error('Error al obtener el resumen diario');
    return null;
  }
};

export const updateDailySummary = async (data: DailySummaryData): Promise<boolean> => {
  try {
    const currentSummary = await getDailySummary();
    
    if (!currentSummary) {
      // If no current summary, create a new one with calculated average ticket
      const summaryWithAverage: DailySummaryData = {
        ...data,
        averageTicket: calculateAverageTicket(data.totalSales, data.orderCount)
      };
      localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaryWithAverage));
      return true;
    }
    
    // Update the existing summary
    const updatedSummary: DailySummaryData = {
      date: data.date,
      totalSales: currentSummary.totalSales + data.totalSales,
      cashSales: currentSummary.cashSales + data.cashSales,
      cardSales: currentSummary.cardSales + data.cardSales,
      transferSales: currentSummary.transferSales + data.transferSales,
      orderCount: currentSummary.orderCount + data.orderCount,
      averageTicket: calculateAverageTicket(
        currentSummary.totalSales + data.totalSales,
        currentSummary.orderCount + data.orderCount
      )
    };
    
    // Store in localStorage
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(updatedSummary));
    
    console.log('Daily summary updated:', updatedSummary);
    return true;
  } catch (error) {
    console.error('Error updating daily summary:', error);
    toast.error('Error al actualizar el resumen diario');
    return false;
  }
};

export const resetDailySummary = async (): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Create empty summary with averageTicket
    const emptySummary: DailySummaryData = {
      date: today,
      totalSales: 0,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      orderCount: 0,
      averageTicket: 0
    };
    
    // Store in localStorage
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(emptySummary));
    
    toast.success('Resumen diario reiniciado correctamente');
    return true;
  } catch (error) {
    console.error('Error resetting daily summary:', error);
    toast.error('Error al reiniciar el resumen diario');
    return false;
  }
};
