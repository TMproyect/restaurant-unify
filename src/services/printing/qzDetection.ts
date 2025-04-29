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
      script.src = `/qz-tray.js?v=${new Date().getTime()}`; // Cache busting
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
 * Create a QZ Tray connection manager with improved reconnection logic
 */
export class QzConnectionManager {
  private statusCallbacks: ((status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'not-installed') => void)[] = [];
  private reconnectTimeout: number | null = null;
  private heartbeatInterval: number | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private reconnectDelay = 2000;
  private heartbeatFrequency = 30000; // 30 seconds
  
  constructor() {
    // Listen for window focus events to check connection status
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.checkConnectionOnFocus.bind(this));
    }
  }

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
      this.scheduleReconnection();
    });

    // Closed callback
    window.qz.websocket.setClosedCallbacks(() => {
      console.warn('QZ Tray connection closed');
      this.handleStatusChange('disconnected');
      this.scheduleReconnection();
    });
    
    // Open callback
    window.qz.websocket.setOpenCallbacks(() => {
      console.log('QZ Tray connection successfully opened');
      this.reconnectAttempts = 0;
      this.handleStatusChange('connected');
      this.startHeartbeat();
    });
  }
  
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = window.setInterval(() => {
      if (!this.isConnected()) {
        console.warn('Heartbeat detected connection is down, attempting reconnect');
        this.scheduleReconnection();
        return;
      }
      
      // Use QZ Tray's heartbeat if available, otherwise just check connection
      if (window.qz && window.qz.heartbeat) {
        window.qz.heartbeat.start();
      }
    }, this.heartbeatFrequency) as unknown as number;
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (window.qz && window.qz.heartbeat) {
      window.qz.heartbeat.stop();
    }
  }
  
  private scheduleReconnection(): void {
    // Cancel any existing reconnect attempt
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Don't attempt reconnection if we've hit the limit
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(`Reached maximum reconnection attempts (${this.maxReconnectAttempts})`);
      return;
    }
    
    // Schedule reconnection with progressive delay
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts + 1} in ${delay}ms`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.connect({
        retries: 1,
        delay: 500
      }).catch(err => {
        console.error('Reconnection attempt failed:', err);
        // If this attempt failed, schedule another
        this.scheduleReconnection();
      });
    }, delay) as unknown as number;
  }
  
  private checkConnectionOnFocus(): void {
    // When window regains focus, check if connection is still active
    if (this.isConnected()) {
      console.log('Window focused, connection is active');
    } else {
      console.log('Window focused, connection is not active, attempting reconnect');
      this.reconnectAttempts = 0;
      this.scheduleReconnection();
    }
  }
  
  public onStatusChange(callback: (status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'not-installed') => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private handleStatusChange(status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'not-installed'): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error executing status callback:', error);
      }
    });
  }
  
  /**
   * Connect to QZ Tray with improved options and error handling
   */
  public async connect(options?: { retries?: number, delay?: number }): Promise<boolean> {
    if (!window.qz) {
      console.error('QZ Tray not available');
      this.handleStatusChange('not-installed');
      return false;
    }
    
    if (!window.qz.websocket) {
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
      
      // Start heartbeat to keep connection alive
      this.startHeartbeat();
      
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
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (!window.qz) {
      console.log('QZ Tray not available for disconnection');
      return false;
    }
    
    if (!window.qz.websocket) {
      console.log('QZ websocket interface not available');
      return false;
    }
    
    if (!window.qz.websocket.isActive()) {
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
