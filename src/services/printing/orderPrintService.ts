
import { Order, OrderItem } from '@/types/order.types';
import printService from './printService';
import printerStationService from './stationService';
import { formatGeneralOrder, formatKitchenOrder, formatPaymentReceipt } from './orderPrintFormatter';
import { toast } from 'sonner';

export class OrderPrintService {
  async printNewOrder(order: Order, items: OrderItem[]): Promise<void> {
    try {
      // 1. Imprimir orden general
      await this.printGeneralOrder(order, items);
      
      // 2. Imprimir comandas por cocina
      await this.printKitchenOrders(order, items);
    } catch (error) {
      console.error('Error printing order:', error);
      toast.error('Error al imprimir la orden');
    }
  }

  private async printGeneralOrder(order: Order, items: OrderItem[]): Promise<void> {
    const generalPrinter = printerStationService.getPrinterForStation('general');
    if (!generalPrinter) {
      console.warn('No general printer configured');
      return;
    }

    const content = formatGeneralOrder(order, items);
    await printService.printRaw(generalPrinter, content);
  }

  private async printKitchenOrders(order: Order, items: OrderItem[]): Promise<void> {
    // Agrupar ítems por cocina
    const itemsByKitchen = new Map<string, OrderItem[]>();
    
    items.forEach(item => {
      const kitchenId = item.kitchen_id || order.kitchen_id || 'main';
      if (!itemsByKitchen.has(kitchenId)) {
        itemsByKitchen.set(kitchenId, []);
      }
      itemsByKitchen.get(kitchenId)?.push(item);
    });

    // Imprimir comandas para cada cocina
    for (const [kitchenId, kitchenItems] of itemsByKitchen) {
      const printerName = printerStationService.getPrinterForStation(kitchenId);
      if (!printerName) {
        console.warn(`No printer configured for kitchen ${kitchenId}`);
        continue;
      }

      const content = formatKitchenOrder(order, kitchenItems, kitchenId);
      await printService.printRaw(printerName, content);
    }
  }

  async printPaymentReceipt(
    order: Order, 
    items: OrderItem[],
    paymentDetails: {
      method: string;
      subtotal: number;
      tax: number;
      tip?: number;
      total: number;
    }
  ): Promise<void> {
    try {
      const cashierPrinter = printerStationService.getPrinterForStation('cashier');
      if (!cashierPrinter) {
        console.warn('No cashier printer configured');
        return;
      }

      const content = formatPaymentReceipt(order, items, paymentDetails);
      await printService.printRaw(cashierPrinter, content);
    } catch (error) {
      console.error('Error printing payment receipt:', error);
      toast.error('Error al imprimir el recibo de pago');
    }
  }
}

export const orderPrintService = new OrderPrintService();
export default orderPrintService;
