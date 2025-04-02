
import { PrinterConfig } from './types';

/**
 * Manages printer-related operations
 */
export class PrinterManager {
  private availablePrinters: PrinterConfig[] = [];
  private defaultPrinter: string | null = null;

  /**
   * Get available printers
   */
  getAvailablePrinters(): PrinterConfig[] {
    return this.availablePrinters;
  }

  /**
   * Get default printer
   */
  getDefaultPrinter(): string | null {
    return this.defaultPrinter;
  }

  /**
   * Refresh the list of available printers
   */
  async refreshPrinters(): Promise<boolean> {
    if (!window.qz) {
      console.error('QZ Tray not available for finding printers');
      return false;
    }

    if (!window.qz.websocket.isActive()) {
      console.error('No active connection for finding printers');
      return false;
    }

    try {
      console.log('Searching for available printers');
      // Get list of available printers
      const printers = await window.qz.printers.find();
      console.log('Printers found:', printers);
      
      this.availablePrinters = printers.map((name: string) => ({
        name,
        isDefault: false
      }));
      
      // Get default printer
      try {
        console.log('Getting default printer');
        const defaultPrinter = await window.qz.printers.getDefault();
        console.log('Default printer:', defaultPrinter);
        
        if (defaultPrinter) {
          this.defaultPrinter = defaultPrinter;
          this.availablePrinters = this.availablePrinters.map(printer => ({
            ...printer,
            isDefault: printer.name === defaultPrinter
          }));
        }
      } catch (defPrinterError) {
        console.error('Error getting default printer:', defPrinterError);
        // Don't fail the entire operation because of this
      }

      return true;
    } catch (error) {
      console.error('Error refreshing printers:', error);
      return false;
    }
  }
}
