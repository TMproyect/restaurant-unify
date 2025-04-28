
import { PrinterConnectionStatus } from '../types';
import { toast } from "sonner";

export class QzWebsocketManager {
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  
  public setupCallbacks(): void {
    if (!window.qz || !window.qz.websocket) {
      console.error("Cannot set up callbacks, QZ Tray not available or not properly initialized");
      return;
    }

    console.log("Setting up QZ Tray callbacks");

    window.qz.websocket.setErrorCallbacks((error: any) => {
      console.error('QZ Tray error:', error);
      this.handleStatusChange('error');
    });

    window.qz.websocket.setClosedCallbacks(() => {
      console.warn('QZ Tray connection closed');
      this.handleStatusChange('disconnected');
    });
    
    window.qz.websocket.setOpenCallbacks(() => {
      console.log('QZ Tray connection successfully opened');
      this.handleStatusChange('connected');
    });
  }
  
  public onStatusChange(callback: (status: PrinterConnectionStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private handleStatusChange(status: PrinterConnectionStatus): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error executing status callback:', error);
      }
    });
  }
  
  public async connect(options?: { retries?: number, delay?: number }): Promise<boolean> {
    if (!window.qz || !window.qz.websocket) {
      console.error('QZ Tray not available');
      return false;
    }
    
    this.handleStatusChange('connecting');
    
    const opts = {
      retries: options?.retries ?? 0,
      delay: options?.delay ?? 0
    };
    
    try {
      console.log('Connecting to QZ Tray');
      await window.qz.websocket.connect(opts);
      console.log('Connected to QZ Tray');
      this.handleStatusChange('connected');
      toast.success("Connected to QZ Tray printing system");
      return true;
    } catch (error) {
      console.error('Error connecting to QZ Tray:', error);
      this.handleStatusChange('error');
      toast.error("Error connecting to QZ Tray", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }
  
  public async disconnect(): Promise<boolean> {
    if (!window.qz) {
      console.log('QZ Tray not available for disconnection');
      return false;
    }
    
    if (!window.qz.websocket.isActive()) {
      console.log('No active QZ Tray connection to disconnect');
      this.handleStatusChange('disconnected');
      return true;
    }
    
    try {
      console.log('Disconnecting from QZ Tray');
      await window.qz.websocket.disconnect();
      this.handleStatusChange('disconnected');
      return true;
    } catch (error) {
      console.error('Error disconnecting from QZ Tray:', error);
      return false;
    }
  }
  
  public isConnected(): boolean {
    return window.qz && window.qz.websocket && window.qz.websocket.isActive();
  }
}
