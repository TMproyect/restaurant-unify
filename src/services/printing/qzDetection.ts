
/**
 * Helper module for QZ Tray detection and setup
 */

// Maximum number of attempts to wait for QZ Tray
const MAX_QZ_WAIT_ATTEMPTS = 120; // 60 seconds at 500ms per attempt

/**
 * Checks if QZ Tray script is loaded in the document
 */
export function isQzScriptLoaded(): boolean {
  const qzScriptTags = document.querySelectorAll('script[src*="qz-tray"]');
  return qzScriptTags.length > 0;
}

/**
 * Attempts to dynamically load the QZ Tray script
 */
export function loadQzScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="qz-tray"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = '/qz-tray.min.js';
        script.defer = true;
        script.onload = () => {
          console.log("QZ Tray script loaded dynamically");
          setTimeout(resolve, 1000); // Give it a second to initialize
        };
        script.onerror = (e) => {
          console.error("Error loading QZ Tray script", e);
          reject(new Error("Could not load QZ Tray script. Verify that the file exists on the server."));
        };
        document.head.appendChild(script);
      } else {
        reject(new Error("Script already exists but QZ Tray is not initialized correctly. Try reloading the page."));
      }
    } catch (err) {
      console.error("Error dynamically adding script", err);
      reject(new Error(`Error adding script: ${err}`));
    }
  });
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
    
    window.addEventListener('qz-tray-available', eventListener as EventListener);
    
    // Check every 500ms
    const interval = setInterval(() => {
      attempts++;

      // Check if qz is available now
      if (window.qz) {
        console.log(`QZ Tray detected after ${attempts * 0.5} seconds`);
        clearInterval(interval);
        window.removeEventListener('qz-tray-available', eventListener as EventListener);
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
        reject(new Error(`QZ Tray not available after ${MAX_QZ_WAIT_ATTEMPTS * 0.5} seconds`));
      }
    }, 500);
  });
}
