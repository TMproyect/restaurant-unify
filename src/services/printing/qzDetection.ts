
// Utilities for detecting and loading QZ Tray
import { toast } from "sonner";

/**
 * Checks if the QZ Tray script is already loaded
 */
export function isQzScriptLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if the script tag exists
  const qzScriptTags = document.querySelectorAll('script[src*="qz-tray"]');
  return qzScriptTags.length > 0;
}

/**
 * Dynamically loads the QZ Tray script
 */
export function loadQzScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in a browser environment'));
      return;
    }
    
    // Check if already loaded
    if (window.qz) {
      resolve();
      return;
    }
    
    // Check if script tag already exists
    if (isQzScriptLoaded()) {
      // Script tag exists but qz object isn't available yet
      // This could happen if the script is still loading
      waitForQZ().then(resolve).catch(reject);
      return;
    }
    
    try {
      const script = document.createElement('script');
      script.src = '/qz-tray.js';
      script.defer = true;
      
      script.onload = () => {
        console.log('🖨️ QZ Tray script loaded successfully');
        waitForQZ().then(resolve).catch(reject);
      };
      
      script.onerror = (err) => {
        console.error('🖨️ Error loading QZ Tray script:', err);
        reject(new Error('Failed to load QZ Tray script'));
      };
      
      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Wait for QZ Tray to be available in the window object
 */
export function waitForQZ(
  maxWaitTime: number = 60000, 
  checkInterval: number = 500
): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already available, resolve immediately
    if (window.qz) {
      resolve();
      return;
    }
    
    let elapsed = 0;
    const check = () => {
      if (window.qz) {
        console.log('🖨️ QZ Tray detected in window');
        
        // Dispatch a custom event that other components can listen for
        try {
          const event = new CustomEvent('qz-tray-available');
          window.dispatchEvent(event);
        } catch (err) {
          console.warn('Could not dispatch qz-tray-available event', err);
        }
        
        resolve();
        return;
      }
      
      elapsed += checkInterval;
      if (elapsed >= maxWaitTime) {
        reject(new Error(`QZ Tray not available after waiting ${maxWaitTime/1000} seconds`));
        return;
      }
      
      setTimeout(check, checkInterval);
    };
    
    check();
  });
}

/**
 * Create a QZ Tray connection manager
 */
export class QzConnectionManager {
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
  
  private statusCallbacks: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void)[] = [];
  
  public onStatusChange(callback: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private handleStatusChange(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
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
  
  /**
   * Disconnect from QZ Tray
   */
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
  
  /**
   * Check if connected to QZ Tray
   */
  public isConnected(): boolean {
    return window.qz && window.qz.websocket && window.qz.websocket.isActive();
  }
}
