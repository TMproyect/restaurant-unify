
import { PrinterConnectionStatus } from './types';

/**
 * Manages connection to QZ Tray websocket
 */
export class QzConnectionManager {
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  /**
   * Set up QZ Tray callbacks
   */
  setupCallbacks(): void {
    if (!window.qz || !window.qz.websocket) {
      console.error("Cannot set up callbacks, QZ Tray not available or not initialized correctly");
      return;
    }

    console.log("Setting up QZ Tray callbacks");

    // Error callback
    window.qz.websocket.setErrorCallbacks((error: any) => {
      console.error('QZ Tray error:', error);
      this.notifyStatusChange('error');
    });

    // Closed callback
    window.qz.websocket.setClosedCallbacks(() => {
      console.warn('QZ Tray connection closed');
      this.notifyStatusChange('disconnected');
    });
    
    // Open callback
    window.qz.websocket.setOpenCallbacks(() => {
      console.log('QZ Tray connection opened successfully');
      this.notifyStatusChange('connected');
      this.connectionAttempts = 0; // Reset connection attempts on success
    });
  }

  /**
   * Connect to QZ Tray
   */
  async connect(): Promise<boolean> {
    if (!window.qz) {
      console.error('QZ Tray not available in the browser');
      this.notifyStatusChange('error');
      return false;
    }
    
    if (!window.qz.websocket) {
      console.error('QZ Tray object does not have websocket property');
      this.notifyStatusChange('error');
      return false;
    }

    console.log('Attempting to connect to QZ Tray. Attempt #', ++this.connectionAttempts);
    
    // If already connected, do nothing
    if (window.qz.websocket.isActive()) {
      console.log('Already connected to QZ Tray');
      this.notifyStatusChange('connected');
      return true;
    }
    
    // If max attempts exceeded, wait before trying again
    if (this.connectionAttempts > this.maxConnectionAttempts) {
      console.log('Too many connection attempts, waiting before retrying');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.connectionAttempts = 1; // Reset counter after waiting
    }

    try {
      this.notifyStatusChange('connecting');
      
      // Connect to QZ Tray
      console.log('Establishing WebSocket connection');
      await window.qz.websocket.connect({
        retries: 2,
        delay: 1
      });
      
      this.notifyStatusChange('connected');
      return true;
    } catch (error) {
      console.error('Error connecting to QZ Tray:', error);
      this.notifyStatusChange('error');
      return false;
    }
  }

  /**
   * Disconnect from QZ Tray
   */
  async disconnect(): Promise<boolean> {
    if (!window.qz) {
      console.log('QZ Tray not available for disconnection');
      this.notifyStatusChange('disconnected');
      return false;
    }

    if (!window.qz.websocket.isActive()) {
      console.log('No active connection to disconnect');
      this.notifyStatusChange('disconnected');
      return false;
    }

    try {
      console.log('Disconnecting from QZ Tray');
      await window.qz.websocket.disconnect();
      this.notifyStatusChange('disconnected');
      return true;
    } catch (error) {
      console.error('Error disconnecting from QZ Tray:', error);
      return false;
    }
  }

  /**
   * Check if connected to QZ Tray
   */
  isConnected(): boolean {
    return window.qz && window.qz.websocket && window.qz.websocket.isActive();
  }

  /**
   * Register status change callback
   * @returns Function to unregister the callback
   */
  onStatusChange(callback: (status: PrinterConnectionStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Return function to unregister callback
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all registered callbacks about status change
   */
  private notifyStatusChange(status: PrinterConnectionStatus): void {
    // Notify all registered callbacks
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error executing status callback:', error);
      }
    });
  }
}
