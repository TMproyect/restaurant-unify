
/**
 * Printer connection status types
 * - 'connecting': Attempting to establish connection
 * - 'connected': Successfully connected to QZ Tray
 * - 'disconnected': No active connection to QZ Tray
 * - 'error': Error occurred during connection or operation
 * - 'not-installed': QZ Tray is not installed or not detected
 */
export type PrinterConnectionStatus = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'not-installed';

/**
 * Printer configuration object
 */
export interface PrinterConfig {
  name: string;
  isDefault: boolean;
  capabilities?: {
    color?: boolean;
    duplex?: boolean;
  };
}

/**
 * Raw print job options
 */
export interface RawPrintOptions {
  encoding?: string;
  language?: string;
}

/**
 * Print job status
 */
export interface PrintJobStatus {
  id: string;
  printerName: string;
  status: 'pending' | 'printing' | 'complete' | 'failed';
  startTime: number;
  endTime?: number;
  error?: string;
}
