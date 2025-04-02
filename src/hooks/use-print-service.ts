
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
    console.log("usePrintService: Iniciando conexión con QZ Tray");
    const success = await printService.connect();
    if (success) {
      console.log("usePrintService: Conexión exitosa");
      setIsConnected(true);
      setAvailablePrinters(printService.getAvailablePrinters());
      setDefaultPrinter(printService.getDefaultPrinter());
      toast.success("Conectado al sistema de impresión QZ Tray");
    } else {
      console.log("usePrintService: Conexión fallida");
      toast.error("No se pudo conectar al sistema de impresión", {
        description: "Verifique que QZ Tray esté instalado y en ejecución",
        duration: 5000,
      });
    }
    return success;
  };
  
  // Disconnect from QZ Tray
  const disconnect = async () => {
    console.log("usePrintService: Iniciando desconexión");
    const success = await printService.disconnect();
    if (success) {
      console.log("usePrintService: Desconexión exitosa");
      setIsConnected(false);
      toast.info("Desconectado del sistema de impresión");
    } else {
      console.log("usePrintService: Desconexión fallida");
    }
    return success;
  };

  // Scan for printers
  const scanForPrinters = async () => {
    console.log("usePrintService: Iniciando escaneo de impresoras");
    if (!isConnected) {
      console.log("usePrintService: No está conectado. Intentando conectar primero...");
      const connectionSuccess = await connect();
      if (!connectionSuccess) {
        console.log("usePrintService: No se pudo conectar para escanear impresoras");
        return false;
      }
    }
    
    setIsScanning(true);
    try {
      console.log("usePrintService: Ejecutando refreshPrinters");
      const success = await printService.refreshPrinters();
      if (success) {
        console.log("usePrintService: Impresoras actualizadas con éxito");
        setAvailablePrinters(printService.getAvailablePrinters());
        setDefaultPrinter(printService.getDefaultPrinter());
        toast.success("Lista de impresoras actualizada");
      } else {
        console.log("usePrintService: No se pudieron actualizar las impresoras");
        toast.error("Error al buscar impresoras");
      }
      return success;
    } catch (error) {
      console.error("usePrintService: Error al escanear impresoras", error);
      toast.error("Error al buscar impresoras");
      return false;
    } finally {
      setIsScanning(false);
    }
  };
  
  // Listen for status changes
  useEffect(() => {
    console.log("usePrintService: Configurando listener de cambios de estado");
    
    const unsubscribe = printService.onStatusChange((newStatus) => {
      console.log("usePrintService: Estado cambiado a", newStatus);
      setStatus(newStatus);
      setIsConnected(printService.isConnected());
      setAvailablePrinters(printService.getAvailablePrinters());
      setDefaultPrinter(printService.getDefaultPrinter());
    });
    
    // Auto-connect on mount (if we're in a relevant page)
    console.log("usePrintService: Intentando conexión automática");
    connect().catch(error => {
      console.error("usePrintService: Error en conexión automática", error);
    });
    
    return () => {
      console.log("usePrintService: Eliminando listener");
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
