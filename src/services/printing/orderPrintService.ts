
import { Order, OrderItem } from '@/types/order.types';
import printService from './printService';
import printerStationService from './stationService';
import { formatGeneralOrder, formatKitchenOrder, formatPaymentReceipt } from './orderPrintFormatter';
import { toast } from 'sonner';

export class OrderPrintService {
  async printNewOrder(order: Order, items: OrderItem[]): Promise<void> {
    try {
      // Verify printer connection before proceeding
      if (!this.verifyPrinterConnection()) {
        return;
      }
      
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
      toast.warning('No hay impresora general configurada', {
        description: 'Configure una impresora para comandas generales en la configuración.',
      });
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
        toast.warning(`No hay impresora configurada para ${kitchenId}`, {
          description: 'Algunos elementos no se imprimirán. Verifique la configuración.',
        });
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
    // Verify printer connection before proceeding
    if (!this.verifyPrinterConnection()) {
      return;
    }

    try {
      const cashierPrinter = printerStationService.getPrinterForStation('cashier');
      if (!cashierPrinter) {
        console.warn('No cashier printer configured');
        toast.warning('No hay impresora de caja configurada', {
          description: 'Configure una impresora para recibos de pago en la configuración.',
        });
        return;
      }

      const content = formatPaymentReceipt(order, items, paymentDetails);
      await printService.printRaw(cashierPrinter, content);
    } catch (error) {
      console.error('Error printing payment receipt:', error);
      toast.error('Error al imprimir el recibo de pago', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
      throw error; // Re-throw to allow handling in the UI
    }
  }

  // Utility method to verify printer connection and handle reconnection if needed
  private verifyPrinterConnection(): boolean {
    if (!printService.isConnected()) {
      toast.error('Sistema de impresión no conectado', {
        description: 'Intente reconectar el sistema de impresión antes de imprimir',
        action: {
          label: "Conectar",
          onClick: () => {
            printService.connect().then((connected) => {
              if (connected) {
                toast.success('Sistema de impresión conectado');
              } else {
                toast.error('No se pudo conectar al sistema de impresión');
              }
            });
          }
        }
      });
      return false;
    }
    return true;
  }
}

export const orderPrintService = new OrderPrintService();
export default orderPrintService;
