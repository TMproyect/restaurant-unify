
import { PrinterConnectionStatus } from './types';
import { QzWebsocketManager } from './services/qzWebsocket';
import { loadQzScript, isQzScriptLoaded, waitForQZ } from './services/scriptLoader';

/**
 * Manages connection to QZ Tray websocket
 */
export class QzConnectionManager {
  private websocketManager = new QzWebsocketManager();
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  /**
   * Set up QZ Tray callbacks
   */
  setupCallbacks(): void {
    this.websocketManager.setupCallbacks();
  }

  /**
   * Connect to QZ Tray
   */
  async connect(): Promise<boolean> {
    console.log('Attempting to connect to QZ Tray. Attempt #', ++this.connectionAttempts);
    
    // If already connected, do nothing
    if (this.websocketManager.isConnected()) {
      console.log('Already connected to QZ Tray');
      return true;
    }
    
    // If max attempts exceeded, wait before trying again
    if (this.connectionAttempts > this.maxConnectionAttempts) {
      console.log('Too many connection attempts, waiting before retrying');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.connectionAttempts = 1; // Reset counter after waiting
    }

    return this.websocketManager.connect({
      retries: 2,
      delay: 1
    });
  }

  /**
   * Disconnect from QZ Tray
   */
  async disconnect(): Promise<boolean> {
    return this.websocketManager.disconnect();
  }

  /**
   * Check if connected to QZ Tray
   */
  isConnected(): boolean {
    return this.websocketManager.isConnected();
  }

  /**
   * Register status change callback
   */
  onStatusChange(callback: (status: PrinterConnectionStatus) => void): () => void {
    return this.websocketManager.onStatusChange(callback);
  }
}

// Re-export utility functions
export { isQzScriptLoaded, loadQzScript, waitForQZ };
