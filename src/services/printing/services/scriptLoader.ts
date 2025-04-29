
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
