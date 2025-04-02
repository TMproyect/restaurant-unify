
import { useState, useEffect, useCallback } from 'react';
import printService, { PrinterConnectionStatus, PrinterConfig } from '@/services/printService';
import { toast } from "sonner";

export function usePrintService() {
  const [status, setStatus] = useState<PrinterConnectionStatus>(printService.getConnectionStatus());
  const [isConnected, setIsConnected] = useState<boolean>(printService.isConnected());
  const [availablePrinters, setAvailablePrinters] = useState<PrinterConfig[]>(printService.getAvailablePrinters());
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(printService.getDefaultPrinter());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  // Connect to QZ Tray
  const connect = useCallback(async () => {
    console.log("usePrintService: Iniciando conexión con QZ Tray");
    try {
      // Verificar si el objeto QZ Tray está disponible en el navegador
      if (typeof window === 'undefined' || !window.qz) {
        console.error("usePrintService: QZ Tray no disponible en el navegador");
        toast.error("No se pudo conectar al sistema de impresión", {
          description: "QZ Tray no está disponible en el navegador",
          duration: 5000,
        });
        return false;
      }
      
      const success = await printService.connect();
      console.log("usePrintService: Resultado conexión =", success);
      
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
    } catch (error) {
      console.error("usePrintService: Error en conexión:", error);
      toast.error("Error al conectar con el sistema de impresión", {
        description: error instanceof Error ? error.message : "Error desconocido",
        duration: 5000,
      });
      return false;
    }
  }, []);
  
  // Disconnect from QZ Tray
  const disconnect = useCallback(async () => {
    console.log("usePrintService: Iniciando desconexión");
    try {
      const success = await printService.disconnect();
      console.log("usePrintService: Resultado desconexión =", success);
      
      if (success) {
        console.log("usePrintService: Desconexión exitosa");
        setIsConnected(false);
        toast.info("Desconectado del sistema de impresión");
      } else {
        console.log("usePrintService: Desconexión fallida");
        toast.error("No se pudo desconectar del sistema de impresión");
      }
      return success;
    } catch (error) {
      console.error("usePrintService: Error en desconexión:", error);
      toast.error("Error al desconectar del sistema de impresión");
      return false;
    }
  }, []);

  // Scan for printers
  const scanForPrinters = useCallback(async () => {
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
        const printers = printService.getAvailablePrinters();
        console.log("usePrintService: Impresoras encontradas:", printers);
        setAvailablePrinters(printers);
        setDefaultPrinter(printService.getDefaultPrinter());
        toast.success("Lista de impresoras actualizada");
        
        if (printers.length === 0) {
          toast.info("No se encontraron impresoras", {
            description: "Asegúrese de que hay impresoras instaladas en el sistema"
          });
        }
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
  }, [isConnected, connect]);
  
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
    console.log("usePrintService: Comprobando si QZ Tray está disponible antes de intentar conexión automática");
    
    if (typeof window !== 'undefined' && window.qz) {
      console.log("usePrintService: QZ Tray disponible, intentando conexión automática");
      connect().catch(error => {
        console.error("usePrintService: Error en conexión automática", error);
      });
    } else {
      console.log("usePrintService: QZ Tray no disponible en este momento");
    }
    
    return () => {
      console.log("usePrintService: Eliminando listener");
      unsubscribe();
    };
  }, [connect]);
  
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
