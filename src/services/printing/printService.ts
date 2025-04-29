
import { toast } from "sonner";
import type { PrinterConnectionStatus, PrinterConfig } from './types';
import { PrinterOperationsService } from './services/printerOperations';
import { isQzScriptLoaded, loadQzScript, waitForQZ, QzConnectionManager } from './qzDetection';
import { PrinterManager } from './printerManager';

/**
 * Improved service for handling printer connections and operations
 */
class PrintService {
  private connectionStatus: PrinterConnectionStatus = 'disconnected';
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  private initialized = false;
  private initializing = false;
  private initializationPromise: Promise<boolean> | null = null;
  
  private connectionManager = new QzConnectionManager();
  private printerManager = new PrinterManager();
  private printerOperations = new PrinterOperationsService();
  
  constructor() {
    // Initialize asynchronously without blocking
    this.initializeAsync();
    
    // Register for connection status updates
    this.connectionManager.onStatusChange((status) => {
      this.updateStatus(status);
    });
    
    // Setup global event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('qz-tray-available', this.handleQzAvailableEvent.bind(this));
    }
  }
  
  /**
   * Handle QZ Tray available event
   */
  private handleQzAvailableEvent(event: Event): void {
    console.log("📌 PrintService: QZ Tray available event received", event);
    
    if (this.initialized) {
      console.log("PrintService: Already initialized, skipping");
      return;
    }
    
    this.setupService();
  }

  /**
   * Initialize asynchronously to avoid blocking the UI
   */
  private async initializeAsync(): Promise<void> {
    try {
      console.log("📌 PrintService: Starting async initialization");
      
      if (typeof window === 'undefined') {
        console.log("PrintService: Not in browser environment, skipping initialization");
        return;
      }
      
      // Check if QZ is already available
      if (window.qz) {
        console.log("PrintService: QZ Tray already available, setting up");
        this.setupService();
        return;
      }
      
      // Wait for QZ to become available (timeout after 10s)
      try {
        const scriptLoaded = isQzScriptLoaded();
        console.log(`PrintService: QZ script ${scriptLoaded ? 'is' : 'is not'} loaded`);
        
        if (!scriptLoaded) {
          console.log("PrintService: Attempting to load QZ script");
          await loadQzScript();
        }
        
        // Short wait to allow script to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (window.qz) {
          console.log("PrintService: QZ Tray available after initialization");
          this.setupService();
        } else {
          console.log("PrintService: QZ Tray still not available after script load");
        }
      } catch (error) {
        console.warn("PrintService: Error during initialization", error);
      }
    } catch (err) {
      console.error("PrintService: Initialization error", err);
    }
  }

  /**
   * Configure service after QZ is available
   */
  private setupService(): void {
    if (this.initialized) return;
    
    try {
      console.log('PrintService: Setting up QZ Tray service');
      this.initialized = true;
      
      this.connectionManager.setupCallbacks();
      console.log('PrintService: QZ Tray callbacks set up');
      
      // If there's already an active connection, update status
      if (window.qz && window.qz.websocket && window.qz.websocket.isActive()) {
        console.log('PrintService: WebSocket connection already active');
        this.updateStatus('connected');
        
        // Refresh printer list
        this.printerManager.refreshPrinters().catch(err => {
          console.error('PrintService: Error refreshing printers during initialization:', err);
        });
      } else {
        console.log('PrintService: No active WebSocket connection');
        this.updateStatus('disconnected');
      }
    } catch (err) {
      console.error("PrintService: Error during setup", err);
      this.initialized = false;
    }
  }

  /**
   * Ensure QZ Tray is fully initialized and ready to use
   * @returns Promise resolving to true if initialized successfully
   */
  public async ensureInitialized(): Promise<boolean> {
    // If already initialized, return immediately
    if (this.initialized) {
      return true;
    }
    
    // If currently initializing, wait for that promise
    if (this.initializing && this.initializationPromise) {
      return this.initializationPromise;
    }
    
    // Start initialization
    this.initializing = true;
    
    this.initializationPromise = (async () => {
      try {
        console.log("PrintService: Starting initialization");
        
        // Load QZ script if needed
        if (!isQzScriptLoaded() && !window.qz) {
          console.log("PrintService: Loading QZ script");
          await loadQzScript();
        }
        
        // Wait for QZ to be available (with timeout)
        try {
          await waitForQZ(10000); // 10 second timeout
        } catch (timeoutError) {
          console.log("PrintService: QZ Tray not available after timeout", timeoutError);
          this.updateStatus('not-installed');
          this.initializing = false;
          return false;
        }
        
        // Setup service
        if (!this.initialized) {
          this.setupService();
        }
        
        this.initializing = false;
        return this.initialized;
      } catch (err) {
        console.error("PrintService: Initialization failed", err);
        this.initializing = false;
        this.updateStatus('error');
        return false;
      }
    })();
    
    return this.initializationPromise;
  }

  /**
   * Update connection status with improved notifications
   */
  private updateStatus(status: PrinterConnectionStatus): void {
    console.log(`PrintService: Updating status from ${this.connectionStatus} to ${status}`);
    
    // Don't update if status hasn't changed
    if (this.connectionStatus === status) {
      return;
    }
    
    // Special notifications for status transitions
    if (status === 'connected' && this.connectionStatus !== 'connected') {
      console.log("PrintService: Connection established");
    } else if (status === 'disconnected' && this.connectionStatus === 'connected') {
      console.warn("PrintService: Connection lost");
      toast.warning("Conexión con el sistema de impresión perdida", {
        description: "Intentando reconectar automáticamente...",
      });
    } else if (status === 'error' && this.connectionStatus !== 'error') {
      console.error("PrintService: Connection error");
      if (this.connectionStatus === 'connected') {
        toast.error("Error en la conexión con el sistema de impresión", {
          description: "Verifique que QZ Tray esté en ejecución",
        });
      }
    }
    
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
   * Connect to QZ Tray with enhanced error handling
   */
  public async connect(): Promise<boolean> {
    console.log('PrintService: Starting connection process');
    
    // Ensure service is initialized
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      console.error('PrintService: Cannot connect - service not initialized');
      toast.error("No se pudo conectar al sistema de impresión", {
        description: "QZ Tray no está instalado o no está en ejecución",
        duration: 5000,
      });
      return false;
    }
    
    // If already connected, return success
    if (this.isConnected()) {
      console.log('PrintService: Already connected');
      return true;
    }
    
    try {
      this.updateStatus('connecting');
      
      // Connect with retries
      const connected = await this.connectionManager.connect({
        retries: 3,
        delay: 1000
      });
      
      if (connected) {
        // Get list of available printers after successful connection
        console.log('PrintService: Connection established, getting printers');
        await this.printerManager.refreshPrinters();
      }

      return connected;
    } catch (error) {
      console.error('PrintService: Error connecting to QZ Tray:', error);
      this.updateStatus('error');
      toast.error("Error conectando con QZ Tray", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      return false;
    }
  }

  /**
   * Refresh the list of available printers
   */
  public async refreshPrinters(): Promise<boolean> {
    console.log('PrintService: Starting printer refresh...');
    
    // Ensure service is initialized
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      console.error('PrintService: Cannot refresh printers - service not initialized');
      toast.error("No se pudieron buscar impresoras", {
        description: "QZ Tray no está instalado o no está en ejecución",
      });
      return false;
    }

    // Check if connected
    if (!this.isConnected()) {
      console.log('PrintService: Not connected, trying to connect before refreshing printers');
      
      // Try to connect first
      const connected = await this.connect();
      
      if (!connected) {
        toast.error("No se pudieron buscar impresoras", {
          description: "No hay conexión activa con QZ Tray",
        });
        return false;
      }
    }

    try {
      const success = await this.printerManager.refreshPrinters();
      
      // Notify user of the result
      const printers = this.printerManager.getAvailablePrinters();
      
      if (printers.length > 0) {
        toast.success(`Se encontraron ${printers.length} impresoras`);
      } else {
        toast.info("No se encontraron impresoras instaladas", {
          description: "Verifique que tenga impresoras configuradas en su sistema",
        });
      }

      return success;
    } catch (error) {
      console.error('PrintService: Error refreshing printers:', error);
      toast.error("Error buscando impresoras", {
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
      toast.info("Desconectado del sistema de impresión");
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
   * Print raw data to a printer
   */
  public async printRaw(
    printerName: string,
    data: string,
    options?: { encoding?: string; language?: string }
  ): Promise<boolean> {
    try {
      // Make sure we're connected before attempting to print
      if (!this.isConnected()) {
        console.log('PrintService: Not connected, attempting to connect before printing');
        const connected = await this.connect();
        if (!connected) {
          console.error('PrintService: Could not connect for printing');
          toast.error("No se pudo imprimir", {
            description: "No hay conexión con el sistema de impresión",
          });
          return false;
        }
      }
      
      return this.printerOperations.printRaw(printerName, data, options);
    } catch (error) {
      console.error('PrintService: Error during print operation:', error);
      toast.error("Error al imprimir", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      return false;
    }
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

// Make it globally available
if (typeof window !== 'undefined') {
  window.printService = {
    printRaw: printService.printRaw.bind(printService)
  };
}

export default printService;
// Re-export types
export type { PrinterConnectionStatus, PrinterConfig };
