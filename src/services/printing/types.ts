
// Type definitions for the print service

// Connection status type
export type PrinterConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'not-installed';

// Printer configuration type
export interface PrinterConfig {
  name: string;
  isDefault: boolean;
}

// Define the global qz object
declare global {
  interface Window {
    qz?: any; // Make sure this is optional with the ? mark
    qzScriptLoaded?: boolean;
  }
}
