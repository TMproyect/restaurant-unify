
import { toast } from "sonner";
import type { PrinterConnectionStatus } from '../types';

/**
 * Class to manage the QZ Tray WebSocket connection
 */
export class QzWebsocketManager {
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  
  /**
   * Set up callbacks for QZ Tray WebSocket events
   */
  public setupCallbacks(): void {
    if (!window.qz || !window.qz.websocket) {
      console.error("Cannot set up callbacks, QZ Tray not available or not properly initialized");
      return;
    }

    console.log("Setting up QZ Tray callbacks");

    // Error callback
    window.qz.websocket.setErrorCallbacks((error: any) => {
      console.error('QZ Tray error:', error);
      this.handleStatusChange('error');
    });

    // Closed callback
    window.qz.websocket.setClosedCallbacks(() => {
      console.warn('QZ Tray connection closed');
      this.handleStatusChange('disconnected');
    });
    
    // Open callback
    window.qz.websocket.setOpenCallbacks(() => {
      console.log('QZ Tray connection successfully opened');
      this.handleStatusChange('connected');
    });
  }
  
  /**
   * Register for status change events
   */
  public onStatusChange(callback: (status: PrinterConnectionStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Handle status change and notify all listeners
   */
  private handleStatusChange(status: PrinterConnectionStatus): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error executing status callback:', error);
      }
    });
  }
  
  /**
   * Connect to QZ Tray
   */
  public async connect(options?: { retries?: number, delay?: number }): Promise<boolean> {
    if (!window.qz || !window.qz.websocket) {
      console.error('QZ Tray websocket interface not available');
      this.handleStatusChange('error');
      return false;
    }
    
    // If already connected, return success
    if (this.isConnected()) {
      console.log('Already connected to QZ Tray');
      this.handleStatusChange('connected');
      return true;
    }
    
    this.handleStatusChange('connecting');
    
    // Configure connection options
    const connectOptions = {
      retries: options?.retries ?? 2, // Default to 2 retries
      delay: options?.delay ?? 1000   // Default to 1 second between retries
    };
    
    // Configure QZ Tray websocket
    window.qz.websocket.setup({
      retries: connectOptions.retries,
      delay: connectOptions.delay,
      connectTimeout: 10000 // 10 seconds connection timeout
    });
    
    try {
      console.log('Connecting to QZ Tray with options:', connectOptions);
      await window.qz.websocket.connect(connectOptions);
      console.log('Connected to QZ Tray');
      
      this.handleStatusChange('connected');
      toast.success("Connected to QZ Tray printing system");
      
      return true;
    } catch (error) {
      console.error('Error connecting to QZ Tray:', error);
      this.handleStatusChange('error');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error("Error connecting to QZ Tray", {
        description: errorMessage,
      });
      
      return false;
    }
  }
  
  /**
   * Disconnect from QZ Tray
   */
  public async disconnect(): Promise<boolean> {
    if (!window.qz || !window.qz.websocket) {
      console.log('QZ websocket interface not available');
      return false;
    }
    
    if (!this.isConnected()) {
      console.log('No active QZ Tray connection to disconnect');
      this.handleStatusChange('disconnected');
      return true;
    }
    
    try {
      console.log('Disconnecting from QZ Tray');
      const result = window.qz.websocket.disconnect();
      this.handleStatusChange('disconnected');
      return result;
    } catch (error) {
      console.error('Error disconnecting from QZ Tray:', error);
      return false;
    }
  }
  
  /**
   * Check if connected to QZ Tray
   */
  public isConnected(): boolean {
    return window.qz && window.qz.websocket && window.qz.websocket.isActive();
  }
}
