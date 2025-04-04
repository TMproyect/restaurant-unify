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
    qz?: any; // Make sure qz is optional (with the ? modifier)
    qzScriptLoaded?: boolean;
  }
}

// Station types for printer configuration
export interface PrinterStation {
  id: string;
  name: string;
  description?: string;
  printerName: string | null;
}

export type StationTypes = 'kitchen' | 'bar' | 'cashier' | 'general';

export interface PrinterStationConfig {
  stations: PrinterStation[];
}
