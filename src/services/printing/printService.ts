
import { toast } from "sonner";
import type { PrinterConnectionStatus, PrinterConfig } from './types';
import { PrinterOperationsService } from './services/printerOperations';
import { InitializationService } from './services/initializationService';
import { QzConnectionManager } from './qzConnection';
import { PrinterManager } from './printerManager';

class PrintService {
  private connectionStatus: PrinterConnectionStatus = 'disconnected';
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  
  private connectionManager = new QzConnectionManager();
  private printerManager = new PrinterManager();
  private printerOperations = new PrinterOperationsService();
  private initService: InitializationService;
  
  constructor() {
    this.initService = new InitializationService(
      this.updateStatus.bind(this),
      this.connectionStatus
    );
    
    // Register for connection status updates
    this.connectionManager.onStatusChange((status) => {
      this.updateStatus(status);
    });
  }

  private updateStatus(status: PrinterConnectionStatus): void {
    console.log(`PrintService: Updating status from ${this.connectionStatus} to ${status}`);
    this.connectionStatus = status;
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('PrintService: Error executing status callback:', error);
      }
    });
  }

  public async connect(): Promise<boolean> {
    console.log('PrintService: Checking QZ Tray availability...');
    
    const qzAvailable = await this.initService.isQzAvailable();
    if (!qzAvailable) {
      this.updateStatus('error');
      toast.error("Could not connect to printing system", {
        description: "QZ Tray is not installed or not running",
        duration: 5000,
      });
      return false;
    }
    
    try {
      this.updateStatus('connecting');
      const connected = await this.connectionManager.connect();
      
      if (connected) {
        await this.printerManager.refreshPrinters();
      }

      return connected;
    } catch (error) {
      console.error('PrintService: Error connecting to QZ Tray:', error);
      this.updateStatus('error');
      toast.error("Error connecting to QZ Tray", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  public async refreshPrinters(): Promise<boolean> {
    console.log('PrintService: Starting printer refresh...');
    
    const qzAvailable = await this.initService.isQzAvailable();
    if (!qzAvailable) {
      toast.error("Could not search for printers", {
        description: "QZ Tray is not installed or not running",
      });
      return false;
    }

    if (!this.isConnected()) {
      console.log('PrintService: Trying to connect before searching printers');
      const connected = await this.connect();
      
      if (!connected) {
        toast.error("Could not search for printers", {
          description: "No active connection to QZ Tray",
        });
        return false;
      }
    }

    try {
      const success = await this.printerManager.refreshPrinters();
      const printers = this.printerManager.getAvailablePrinters();
      
      if (printers.length > 0) {
        toast.success(`Found ${printers.length} printers`);
      } else {
        toast.info("No installed printers found", {
          description: "Verify that you have printers configured in your system",
        });
      }

      return success;
    } catch (error) {
      console.error('PrintService: Error refreshing printers:', error);
      toast.error("Error searching for printers", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  public async disconnect(): Promise<boolean> {
    console.log('PrintService: Starting disconnection process...');
    const result = await this.connectionManager.disconnect();
    if (result) {
      toast.info("Disconnected from printing system");
    }
    return result;
  }

  public isConnected(): boolean {
    return this.printerOperations.isConnected();
  }

  public getConnectionStatus(): PrinterConnectionStatus {
    return this.connectionStatus;
  }

  public getAvailablePrinters(): PrinterConfig[] {
    return this.printerManager.getAvailablePrinters();
  }

  public getDefaultPrinter(): string | null {
    return this.printerManager.getDefaultPrinter();
  }

  public async printRaw(
    printerName: string,
    data: string,
    options?: { encoding?: string; language?: string }
  ): Promise<boolean> {
    return this.printerOperations.printRaw(printerName, data, options);
  }

  public onStatusChange(callback: (status: PrinterConnectionStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Create singleton instance
const printService = new PrintService();

// Register the printService on the global window object for easy access
if (typeof window !== 'undefined') {
  window.printService = {
    printRaw: printService.printRaw.bind(printService)
  };
}

export default printService;
export type { PrinterConnectionStatus, PrinterConfig };
