
export interface PrinterInfo {
  name: string;
  isDefault?: boolean;
}

export interface PrinterStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  availablePrinters: PrinterInfo[];
  defaultPrinter: string | null;
}

export interface PrinterConfigProps {
  status: string;
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  availablePrinters: PrinterInfo[];
  showQzDiagnostics: boolean;
  showPrinterDiagnostics: boolean;
  setShowQzDiagnostics: (show: boolean) => void;
  setShowPrinterDiagnostics: (show: boolean) => void;
  handleConnect: () => void;
  handleRefreshPrinters: () => void;
}

export interface QzConnectionGuideProps {
  handleConnect: () => void;
  isConnecting: boolean;
}

export interface AvailablePrintersProps {
  isConnected: boolean;
  availablePrinters: PrinterInfo[];
  isConnecting: boolean;
  onShowPrinterDiagnostics: () => void;
}
