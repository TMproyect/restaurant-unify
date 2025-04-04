
import { toast } from "sonner";
import type { PrinterConnectionStatus, PrinterConfig } from './types';
import { isQzScriptLoaded, loadQzScript, waitForQZ } from './qzDetection';
import { QzConnectionManager } from './qzConnection';
import { PrinterManager } from './printerManager';

/**
 * Main service for handling printer connections and operations
 */
class PrintService {
  private isReady = false;
  private connectionStatus: PrinterConnectionStatus = 'disconnected';
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  private qzCheckInterval: number | null = null;
  
  private connectionManager = new QzConnectionManager();
  private printerManager = new PrinterManager();
  
  constructor() {
    // Initialize when the service is created
    this.initialize();
  }

  /**
   * Initialize the service and QZ Tray
   */
  private initialize(): void {
    console.log("🖨️ PrintService: Initializing printing service");
    
    if (typeof window !== 'undefined') {
      console.log("🖨️ PrintService: Setting up event listeners for QZ Tray");
      
      // Immediate check in case QZ is already available
      this.checkQzAvailability();
      
      // Listen for the custom event from the script in index.html
      window.addEventListener('qz-tray-available', (event: CustomEvent) => {
        console.log("🖨️ PrintService: QZ-TRAY-AVAILABLE event received");
        if (this.isReady) return;
        
        this.setupService();
      });
      
      // Also set up an interval as a backup
      this.qzCheckInterval = window.setInterval(() => {
        this.checkQzAvailability();
      }, 3000); // Check every 3 seconds
      
      // Clear interval after 30 seconds to avoid running forever
      setTimeout(() => {
        if (this.qzCheckInterval !== null) {
          window.clearInterval(this.qzCheckInterval);
          this.qzCheckInterval = null;
        }
      }, 30000);
    }
  }

  /**
   * Check if QZ Tray is available
   */
  private checkQzAvailability(): void {
    // Only check if we're not already ready
    if (this.isReady) return;
    
    // Use a less verbose log once initialization is done
    if (this.connectionStatus !== 'disconnected') {
      console.debug("🖨️ PrintService: Checking QZ Tray availability");
    } else {
      console.log("🖨️ PrintService: Checking QZ Tray availability");
    }
    
    if (window.qz) {
      console.log("🖨️ PrintService: QZ Tray detected in periodic check");
      
      // If already ready, do nothing
      if (this.isReady) {
        return;
      }

      this.setupService();
      
      // Clear the interval since we've found QZ Tray
      if (this.qzCheckInterval !== null) {
        window.clearInterval(this.qzCheckInterval);
        this.qzCheckInterval = null;
      }
    } else {
      // Use debug level to reduce noise in the console
      console.debug("🖨️ PrintService: QZ Tray not available in this check");
    }
  }

  /**
   * Ensure QZ Tray is available, with retries
   */
  public async isQzAvailable(): Promise<boolean> {
    console.log("🖨️ PrintService: Verifying QZ Tray availability");
    console.log("🖨️ PrintService: window.qz =", window.qz ? "AVAILABLE" : "NOT AVAILABLE");
    
    // If QZ Tray is already available, return true immediately
    if (window.qz) {
      console.log("🖨️ PrintService: QZ Tray is already available");
      
      // Set up the service if not ready yet
      if (!this.isReady) {
        this.setupService();
      }
      
      return true;
    }
    
    // Check if the script is loaded
    if (!isQzScriptLoaded()) {
      console.warn("🖨️ PrintService: No QZ Tray script tag found");
      
      // Try to load dynamically
      try {
        console.log("🖨️ PrintService: Attempting to load QZ Tray dynamically");
        await loadQzScript();
        console.log("🖨️ PrintService: QZ Tray script added dynamically");
      } catch (err) {
        console.error("🖨️ PrintService: Error adding script dynamically", err);
        this.updateStatus('not-installed');
        return false;
      }
    }
    
    // Wait for QZ to be available
    try {
      console.log("🖨️ PrintService: QZ Tray not immediately available, waiting");
      await waitForQZ();
      
      console.log("🖨️ PrintService: QZ Tray available after waiting");
      
      if (!this.isReady) {
        this.setupService();
      }
      
      return true;
    } catch (error) {
      console.error("🖨️ PrintService: Error waiting for QZ Tray:", error);
      this.updateStatus('not-installed');
      return false;
    }
  }

  /**
   * Configure service after QZ is available
   */
  private setupService(): void {
    this.isReady = true;
    this.connectionManager.setupCallbacks();
    console.log('PrintService: QZ Tray service initialized');
    
    // Register for connection status updates
    this.connectionManager.onStatusChange((status) => {
      this.updateStatus(status);
    });
    
    // If there's already an active connection, update status
    if (window.qz && window.qz.websocket && window.qz.websocket.isActive()) {
      console.log('PrintService: WebSocket connection already active');
      this.updateStatus('connected');
      this.printerManager.refreshPrinters().catch(err => {
        console.error('PrintService: Error refreshing printers during initialization:', err);
      });
    } else {
      console.log('PrintService: No active WebSocket connection');
      this.updateStatus('disconnected');
    }
    
    // Clear the check interval if it's still running
    if (this.qzCheckInterval !== null) {
      window.clearInterval(this.qzCheckInterval);
      this.qzCheckInterval = null;
    }
  }

  /**
   * Update connection status and notify listeners
   */
  private updateStatus(status: PrinterConnectionStatus): void {
    console.log(`PrintService: Updating status from ${this.connectionStatus} to ${status}`);
    this.connectionStatus = status;
    // Notify all registered callbacks
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('PrintService: Error executing status callback:', error);
      }
    });
  }

  /**
   * Connect to QZ Tray
   */
  public async connect(): Promise<boolean> {
    console.log('PrintService: Checking QZ Tray availability...');
    
    // Check if QZ is available or wait for it
    const qzAvailable = await this.isQzAvailable();
    if (!qzAvailable) {
      console.error('PrintService: QZ Tray not available in browser');
      this.updateStatus('error');
      toast.error("Could not connect to printing system", {
        description: "QZ Tray is not installed or not running",
        duration: 5000,
      });
      return false;
    }
    
    try {
      this.updateStatus('connecting');
      
      // Connect to QZ Tray
      const connected = await this.connectionManager.connect();
      
      if (connected) {
        // Get list of available printers after successful connection
        console.log('PrintService: Connection established, getting printers');
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

  /**
   * Refresh the list of available printers
   */
  public async refreshPrinters(): Promise<boolean> {
    console.log('PrintService: Starting printer refresh...');
    
    // Check if QZ is available
    const qzAvailable = await this.isQzAvailable();
    if (!qzAvailable) {
      console.error('PrintService: QZ Tray not available for finding printers');
      toast.error("Could not search for printers", {
        description: "QZ Tray is not installed or not running",
      });
      return false;
    }

    if (!this.connectionManager.isConnected()) {
      console.error('PrintService: No active connection for searching printers');
      
      // Try to connect first
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
      
      // Notify user of the result
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

  /**
   * Print data to a printer using QZ Tray
   */
  public async printRaw(
    printerName: string,
    data: string,
    options: { encoding?: string; language?: string } = {}
  ): Promise<boolean> {
    console.log(`PrintService: Attempting to print to ${printerName}`);
    
    if (!this.connectionManager.isConnected()) {
      console.error('PrintService: No active connection for printing');
      toast.error("No se puede imprimir", {
        description: "El sistema de impresión no está conectado",
        duration: 5000,
      });
      return false;
    }
    
    try {
      // Ensure QZ is available
      const qzAvailable = await this.isQzAvailable();
      if (!qzAvailable) {
        console.error('PrintService: QZ Tray not available for printing');
        toast.error("No se puede imprimir", {
          description: "QZ Tray no está disponible",
        });
        return false;
      }

      // Create printer config
      console.log('PrintService: Creating printer config');
      const config = window.qz.configs.create(printerName, {
        encoding: options.encoding || 'UTF-8',
        language: options.language || 'escpos'
      });

      // Prepare print data
      const printData = [{
        type: 'raw',
        format: 'escpos',
        flavor: 'plain',
        data: data
      }];

      console.log('PrintService: Sending print job to QZ Tray');
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

  /**
   * Disconnect from QZ Tray
   */
  public async disconnect(): Promise<boolean> {
    console.log('PrintService: Starting disconnection process...');
    
    const result = await this.connectionManager.disconnect();
    
    if (result) {
      toast.info("Disconnected from printing system");
    }
    
    return result;
  }

  /**
   * Check if connected to QZ Tray
   */
  public isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): PrinterConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Get available printers
   */
  public getAvailablePrinters(): PrinterConfig[] {
    return this.printerManager.getAvailablePrinters();
  }

  /**
   * Get default printer
   */
  public getDefaultPrinter(): string | null {
    return this.printerManager.getDefaultPrinter();
  }

  /**
   * Register status change callback
   */
  public onStatusChange(callback: (status: PrinterConnectionStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Return function to unregister callback
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
// Re-export types with the correct syntax for isolated modules
export type { PrinterConnectionStatus, PrinterConfig };
