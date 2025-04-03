
/**
 * Helper module for QZ Tray detection and setup
 */

// Maximum number of attempts to wait for QZ Tray
const MAX_QZ_WAIT_ATTEMPTS = 60; // 30 seconds at 500ms per attempt

/**
 * Checks if QZ Tray script is loaded in the document
 */
export function isQzScriptLoaded(): boolean {
  console.log("Checking if QZ Tray script is loaded in the document");

  // First check our custom flag
  if (window.qzScriptLoaded) {
    console.log("QZ Tray script is marked as loaded via window.qzScriptLoaded flag");
    return true;
  }
  
  // Then check for script tags
  const qzScriptTags = document.querySelectorAll('script[src*="qz-tray.js"]');
  if (qzScriptTags.length > 0) {
    console.log(`Found ${qzScriptTags.length} QZ Tray script tags in document`);
    return true;
  } else {
    console.warn("No QZ Tray script tags found in document");
    return false;
  }
}

/**
 * Attempts to dynamically load the QZ Tray script
 */
export function loadQzScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Attempting to load QZ Tray script dynamically");
      
      // Check if the script already exists
      const existingScript = document.querySelector('script[src*="qz-tray.js"]');
      if (existingScript) {
        console.log("QZ Tray script already exists in document:", existingScript);
        
        // If the script is already loaded but no qz object, something might be wrong
        if (!window.qz && !window.qzScriptLoaded) {
          console.warn("QZ Tray script exists but appears not to be loaded correctly");
        }
        
        // Set a timeout to give it time to initialize
        setTimeout(() => {
          if (window.qz) {
            window.qzScriptLoaded = true;
            console.log("QZ Tray object available after waiting");
            resolve();
          } else {
            console.log("Re-creating QZ Tray script element");
            // Remove the existing script
            existingScript.remove();
            // Create a new script element
            createAndAppendScript(resolve, reject);
          }
        }, 1000);
      } else {
        createAndAppendScript(resolve, reject);
      }
    } catch (err) {
      console.error("Error handling QZ Tray script", err);
      reject(new Error(`Error handling QZ Tray script: ${err}`));
    }
  });
}

/**
 * Helper function to create and append the QZ Tray script
 */
function createAndAppendScript(resolve: () => void, reject: (error: Error) => void): void {
  const script = document.createElement('script');
  
  // Add a timestamp to prevent caching issues
  const timestamp = new Date().getTime();
  script.src = `/qz-tray.js?t=${timestamp}`;
  script.async = false;
  
  script.onload = () => {
    console.log("QZ Tray script loaded dynamically");
    
    // Give it a second to initialize
    setTimeout(() => {
      if (window.qz) {
        window.qzScriptLoaded = true;
        console.log("QZ Tray object available after dynamic load:", window.qz);
        window.dispatchEvent(new CustomEvent('qz-tray-available', { detail: window.qz }));
        resolve();
      } else {
        console.warn("QZ Tray script loaded but window.qz is not available");
        
        // Let's check if the script was maybe loaded but has errors
        try {
          const scriptElement = document.querySelector(`script[src*="qz-tray.js"]`);
          console.log("Script element status:", scriptElement);
        } catch (e) {
          console.error("Error checking script element:", e);
        }
        
        // We'll resolve anyway since the script loaded, even if qz isn't available yet
        resolve();
      }
    }, 1000);
  };
  
  script.onerror = (e) => {
    console.error("Error loading QZ Tray script", e);
    window.dispatchEvent(new CustomEvent('qz-tray-load-error', { detail: e }));
    reject(new Error("Could not load QZ Tray script. Verify that the file exists on the server."));
  };
  
  document.body.appendChild(script);
  console.log("QZ Tray script appended to document body");
}

/**
 * Waits for QZ Tray to be available in the window object
 */
export function waitForQZ(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.qz) {
      console.log("QZ Tray detected immediately in waitForQZ");
      resolve();
      return;
    }

    console.log("Waiting for QZ Tray...");
    
    // Track attempts
    let attempts = 0;
    
    // Also listen for the event as an alternative method
    const eventListener = (event: CustomEvent) => {
      console.log("QZ Tray available via custom event");
      window.removeEventListener('qz-tray-available', eventListener as EventListener);
      resolve();
    };
    
    const errorListener = (event: CustomEvent) => {
      console.error("QZ Tray script load error via custom event", event.detail);
      window.removeEventListener('qz-tray-load-error', errorListener as EventListener);
      reject(new Error("QZ Tray script failed to load properly"));
    };
    
    window.addEventListener('qz-tray-available', eventListener as EventListener);
    window.addEventListener('qz-tray-load-error', errorListener as EventListener);
    
    // Check every 500ms
    const interval = setInterval(() => {
      attempts++;

      // Check if qz is available now
      if (window.qz) {
        console.log(`QZ Tray detected after ${attempts * 0.5} seconds`);
        clearInterval(interval);
        window.removeEventListener('qz-tray-available', eventListener as EventListener);
        window.removeEventListener('qz-tray-load-error', errorListener as EventListener);
        resolve();
        return;
      }
      
      // Log periodically but not on every attempt to avoid console spam
      if (attempts % 5 === 0) {
        console.log(`Waiting for QZ Tray... (${attempts * 0.5}s / ${MAX_QZ_WAIT_ATTEMPTS * 0.5}s)`);
        console.log("Current state of window.qz =", window.qz || "undefined");
      }
      
      if (attempts >= MAX_QZ_WAIT_ATTEMPTS) {
        console.log(`QZ Tray not available after ${MAX_QZ_WAIT_ATTEMPTS * 0.5} seconds`);
        console.log("Final check of window.qz =", window.qz || "undefined");
        clearInterval(interval);
        window.removeEventListener('qz-tray-available', eventListener as EventListener);
        window.removeEventListener('qz-tray-load-error', errorListener as EventListener);
        reject(new Error(`QZ Tray not available after ${MAX_QZ_WAIT_ATTEMPTS * 0.5} seconds. Make sure QZ Tray is installed and running on your computer.`));
      }
    }, 500);
  });
}

// Note: No need to redeclare the Window interface here as it's already declared in types.ts
