
import { useState, useEffect } from 'react';
import printService, { PrinterConnectionStatus, PrinterConfig } from '@/services/printService';
import { toast } from "sonner";

export function usePrintService() {
  const [status, setStatus] = useState<PrinterConnectionStatus>(printService.getConnectionStatus());
  const [isConnected, setIsConnected] = useState<boolean>(printService.isConnected());
  const [availablePrinters, setAvailablePrinters] = useState<PrinterConfig[]>(printService.getAvailablePrinters());
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(printService.getDefaultPrinter());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  // Connect to QZ Tray
  const connect = async () => {
    const success = await printService.connect();
    if (success) {
      setIsConnected(true);
      setAvailablePrinters(printService.getAvailablePrinters());
      setDefaultPrinter(printService.getDefaultPrinter());
      toast.success("Conectado al sistema de impresión QZ Tray");
    } else {
      toast.error("No se pudo conectar al sistema de impresión", {
        description: "Verifique que QZ Tray esté instalado y en ejecución",
        duration: 5000,
      });
    }
    return success;
  };
  
  // Disconnect from QZ Tray
  const disconnect = async () => {
    const success = await printService.disconnect();
    if (success) {
      setIsConnected(false);
      toast.info("Desconectado del sistema de impresión");
    }
    return success;
  };

  // Scan for printers
  const scanForPrinters = async () => {
    if (!isConnected) {
      const connectionSuccess = await connect();
      if (!connectionSuccess) return false;
    }
    
    setIsScanning(true);
    try {
      const success = await printService.refreshPrinters();
      if (success) {
        setAvailablePrinters(printService.getAvailablePrinters());
        setDefaultPrinter(printService.getDefaultPrinter());
        toast.success("Lista de impresoras actualizada");
      } else {
        toast.error("Error al buscar impresoras");
      }
      return success;
    } catch (error) {
      toast.error("Error al buscar impresoras");
      return false;
    } finally {
      setIsScanning(false);
    }
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
    defaultPrinter,
    scanForPrinters,
    isScanning
  };
}

export default usePrintService;
