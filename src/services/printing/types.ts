
// Type definitions for the print service

// Connection status type
export type PrinterConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Printer configuration type
export interface PrinterConfig {
  name: string;
  isDefault: boolean;
}

// Define the global qz object
declare global {
  interface Window {
    qz: any;
  }
}
