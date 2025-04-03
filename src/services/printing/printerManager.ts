
// Printer management functionality
import { toast } from "sonner";
import type { PrinterConfig } from './types';

/**
 * Class to manage printer discovery and operations
 */
export class PrinterManager {
  private availablePrinters: PrinterConfig[] = [];
  private defaultPrinter: string | null = null;
  
  /**
   * Refresh the list of available printers
   */
  public async refreshPrinters(): Promise<boolean> {
    console.log('Finding available printers');
    
    if (!window.qz || !window.qz.printers) {
      console.error('QZ Tray not available for finding printers');
      return false;
    }

    try {
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
        // Don't fail the whole operation for this
      }

      return true;
    } catch (error) {
      console.error('Error refreshing printers:', error);
      return false;
    }
  }
  
  /**
   * Get all available printers
   */
  public getAvailablePrinters(): PrinterConfig[] {
    return this.availablePrinters;
  }
  
  /**
   * Get the default printer
   */
  public getDefaultPrinter(): string | null {
    return this.defaultPrinter;
  }
}
