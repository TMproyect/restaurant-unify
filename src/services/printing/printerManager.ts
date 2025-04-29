
// Printer management functionality
import { toast } from "sonner";
import type { PrinterConfig } from './types';

/**
 * Class to manage printer discovery and operations
 * with improved error handling and retry logic
 */
export class PrinterManager {
  private availablePrinters: PrinterConfig[] = [];
  private defaultPrinter: string | null = null;
  private lastRefresh: number = 0;
  private refreshInProgress: boolean = false;
  private refreshMinInterval: number = 2000; // Minimum 2 seconds between refreshes
  
  /**
   * Refresh the list of available printers
   * with improved error handling and throttling
   */
  public async refreshPrinters(): Promise<boolean> {
    // Check if refresh is already in progress
    if (this.refreshInProgress) {
      console.log('Printer refresh already in progress, skipping');
      return false;
    }
    
    // Check if we've refreshed too recently
    const now = Date.now();
    if (now - this.lastRefresh < this.refreshMinInterval) {
      console.log('Refresh requested too soon after previous refresh, skipping');
      return true; // Return true to avoid showing errors for throttling
    }
    
    console.log('Finding available printers');
    this.refreshInProgress = true;
    
    if (!window.qz || !window.qz.printers) {
      this.refreshInProgress = false;
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
      
      this.lastRefresh = Date.now();
      this.refreshInProgress = false;
      return true;
    } catch (error) {
      console.error('Error refreshing printers:', error);
      this.refreshInProgress = false;
      
      // Add a more specific error message
      let errorMsg = "Error desconocido al buscar impresoras";
      
      if (error instanceof Error) {
        errorMsg = error.message;
        
        if (errorMsg.includes('timed out') || errorMsg.includes('timeout')) {
          errorMsg = "Tiempo de espera agotado al buscar impresoras";
        }
        
        if (errorMsg.includes('not found') || errorMsg.includes('no printers')) {
          errorMsg = "No se encontraron impresoras en el sistema";
        }
      }
      
      toast.error("No se pudieron encontrar impresoras", {
        description: errorMsg
      });
      
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
  
  /**
   * Check if a specific printer exists
   */
  public hasPrinter(printerName: string): boolean {
    return this.availablePrinters.some(p => p.name === printerName);
  }
}
