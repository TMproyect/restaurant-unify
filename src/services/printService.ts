
// QZ Tray service for handling printer connections
import { toast } from "sonner";

// Define the global qz object
declare global {
  interface Window {
    qz: any;
  }
}

// Connection status type
export type PrinterConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Printer configuration type
export interface PrinterConfig {
  name: string;
  isDefault: boolean;
}

class PrintService {
  private isReady = false;
  private connectionStatus: PrinterConnectionStatus = 'disconnected';
  private availablePrinters: PrinterConfig[] = [];
  private defaultPrinter: string | null = null;
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];

  constructor() {
    // Initialize when the service is created
    this.initialize();
  }

  // Initialize the service and QZ Tray
  private initialize() {
    // Check if qz is available (wait for script to load)
    if (typeof window !== 'undefined') {
      this.waitForQZ().then(() => {
        this.isReady = true;
        this.setupCallbacks();
        console.log('QZ Tray service initialized');
      }).catch(err => {
        console.error('Failed to initialize QZ Tray:', err);
        this.updateStatus('error');
      });
    }
  }

  // Wait for QZ to be available
  private waitForQZ(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.qz) {
        resolve();
        return;
      }

      // Check every 500ms for 10 seconds (20 attempts)
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.qz) {
          clearInterval(interval);
          resolve();
          return;
        }

        attempts++;
        if (attempts >= 20) {
          clearInterval(interval);
          reject(new Error('QZ Tray no disponible después de 10 segundos'));
        }
      }, 500);
    });
  }

  // Set up QZ Tray callbacks
  private setupCallbacks() {
    if (!window.qz) return;

    // Error callback
    window.qz.websocket.setErrorCallbacks((error: any) => {
      console.error('QZ Tray error:', error);
      this.updateStatus('error');
    });

    // Closed callback
    window.qz.websocket.setClosedCallbacks(() => {
      console.warn('QZ Tray connection closed');
      this.updateStatus('disconnected');
    });
  }

  // Update connection status and notify listeners
  private updateStatus(status: PrinterConnectionStatus) {
    this.connectionStatus = status;
    // Notify all registered callbacks
    this.statusCallbacks.forEach(callback => callback(status));
  }

  // Connect to QZ Tray
  public async connect(): Promise<boolean> {
    if (!window.qz) {
      console.error('QZ Tray no está disponible');
      this.updateStatus('error');
      return false;
    }

    try {
      this.updateStatus('connecting');
      
      // Connect to QZ Tray
      await window.qz.websocket.connect();
      
      // Get list of available printers after successful connection
      await this.refreshPrinters();

      this.updateStatus('connected');
      return true;
    } catch (error) {
      console.error('Error connecting to QZ Tray:', error);
      this.updateStatus('error');
      return false;
    }
  }

  // Refresh the list of available printers
  public async refreshPrinters(): Promise<boolean> {
    if (!window.qz || !window.qz.websocket.isActive()) {
      return false;
    }

    try {
      // Get list of available printers
      const printers = await window.qz.printers.find();
      this.availablePrinters = printers.map((name: string) => ({
        name,
        isDefault: false
      }));
      
      // Get default printer
      const defaultPrinter = await window.qz.printers.getDefault();
      if (defaultPrinter) {
        this.defaultPrinter = defaultPrinter;
        this.availablePrinters = this.availablePrinters.map(printer => ({
          ...printer,
          isDefault: printer.name === defaultPrinter
        }));
      }

      return true;
    } catch (error) {
      console.error('Error refreshing printers:', error);
      return false;
    }
  }

  // Disconnect from QZ Tray
  public async disconnect(): Promise<boolean> {
    if (!window.qz || !window.qz.websocket.isActive()) {
      this.updateStatus('disconnected');
      return false;
    }

    try {
      await window.qz.websocket.disconnect();
      this.updateStatus('disconnected');
      return true;
    } catch (error) {
      console.error('Error disconnecting from QZ Tray:', error);
      return false;
    }
  }

  // Check if connected to QZ Tray
  public isConnected(): boolean {
    return window.qz && window.qz.websocket.isActive();
  }

  // Get connection status
  public getConnectionStatus(): PrinterConnectionStatus {
    return this.connectionStatus;
  }

  // Get available printers
  public getAvailablePrinters(): PrinterConfig[] {
    return this.availablePrinters;
  }

  // Get default printer
  public getDefaultPrinter(): string | null {
    return this.defaultPrinter;
  }

  // Register status change callback
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

export default printService;
