
import { toast } from "sonner";
import type { PrinterConnectionStatus } from '../types';

export class PrinterOperationsService {
  async printRaw(
    printerName: string,
    data: string,
    options: { encoding?: string; language?: string } = {}
  ): Promise<boolean> {
    console.log(`PrintService: Attempting to print to ${printerName}`);
    
    if (!this.isConnected()) {
      console.error('PrintService: No active connection for printing');
      toast.error("No se puede imprimir", {
        description: "El sistema de impresión no está conectado",
        duration: 5000,
      });
      return false;
    }
    
    try {
      if (!window.qz) {
        console.error('PrintService: QZ Tray not available for printing');
        toast.error("No se puede imprimir", {
          description: "QZ Tray no está disponible",
        });
        return false;
      }

      const config = window.qz.configs.create(printerName, {
        encoding: options.encoding || 'UTF-8',
        language: options.language || 'escpos'
      });

      const printData = [{
        type: 'raw',
        format: 'escpos',
        flavor: 'plain',
        data: data
      }];

      await window.qz.print(config, printData);
      console.log('PrintService: Print job sent successfully');
      return true;
    } catch (error) {
      console.error('PrintService: Error printing:', error);
      toast.error("Error al enviar a la impresora", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      return false;
    }
  }

  isConnected(): boolean {
    return window.qz && window.qz.websocket && window.qz.websocket.isActive();
  }
}
