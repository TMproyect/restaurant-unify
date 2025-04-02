
import { useState, useEffect } from 'react';
import printService, { PrinterConnectionStatus, PrinterConfig } from '@/services/printService';

export function usePrintService() {
  const [status, setStatus] = useState<PrinterConnectionStatus>(printService.getConnectionStatus());
  const [isConnected, setIsConnected] = useState<boolean>(printService.isConnected());
  const [availablePrinters, setAvailablePrinters] = useState<PrinterConfig[]>(printService.getAvailablePrinters());
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(printService.getDefaultPrinter());
  
  // Connect to QZ Tray
  const connect = async () => {
    const success = await printService.connect();
    if (success) {
      setIsConnected(true);
      setAvailablePrinters(printService.getAvailablePrinters());
      setDefaultPrinter(printService.getDefaultPrinter());
    }
    return success;
  };
  
  // Disconnect from QZ Tray
  const disconnect = async () => {
    const success = await printService.disconnect();
    if (success) {
      setIsConnected(false);
    }
    return success;
  };
  
  // Listen for status changes
  useEffect(() => {
    const unsubscribe = printService.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setIsConnected(printService.isConnected());
      setAvailablePrinters(printService.getAvailablePrinters());
      setDefaultPrinter(printService.getDefaultPrinter());
    });
    
    // Auto-connect on mount (if we're in a relevant page)
    connect().catch(console.error);
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return {
    status,
    isConnected,
    connect,
    disconnect,
    availablePrinters,
    defaultPrinter
  };
}

export default usePrintService;
