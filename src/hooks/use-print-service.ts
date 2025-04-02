
import { useState, useEffect, useCallback } from 'react';
import printService, { PrinterConnectionStatus, PrinterConfig } from '@/services/printing/printService';
import { toast } from "sonner";

export function usePrintService() {
  const [status, setStatus] = useState<PrinterConnectionStatus>(printService.getConnectionStatus());
  const [isConnected, setIsConnected] = useState<boolean>(printService.isConnected());
  const [availablePrinters, setAvailablePrinters] = useState<PrinterConfig[]>(printService.getAvailablePrinters());
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(printService.getDefaultPrinter());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  // Connect to QZ Tray
  const connect = useCallback(async () => {
    console.log("usePrintService: Starting connection to QZ Tray");
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.error("usePrintService: Not in a browser environment");
        toast.error("Could not connect to printing system", {
          description: "Not in a browser environment",
          duration: 5000,
        });
        return false;
      }
      
      const success = await printService.connect();
      console.log("usePrintService: Connection result =", success);
      
      if (success) {
        console.log("usePrintService: Successful connection");
        setIsConnected(true);
        setAvailablePrinters(printService.getAvailablePrinters());
        setDefaultPrinter(printService.getDefaultPrinter());
      } else {
        console.log("usePrintService: Connection failed");
      }
      return success;
    } catch (error) {
      console.error("usePrintService: Connection error:", error);
      toast.error("Error connecting to printing system", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 5000,
      });
      return false;
    }
  }, []);
  
  // Disconnect from QZ Tray
  const disconnect = useCallback(async () => {
    console.log("usePrintService: Starting disconnection");
    try {
      const success = await printService.disconnect();
      console.log("usePrintService: Disconnection result =", success);
      
      if (success) {
        console.log("usePrintService: Successful disconnection");
        setIsConnected(false);
      } else {
        console.log("usePrintService: Disconnection failed");
      }
      return success;
    } catch (error) {
      console.error("usePrintService: Disconnection error:", error);
      toast.error("Error disconnecting from printing system");
      return false;
    }
  }, []);

  // Scan for printers
  const scanForPrinters = useCallback(async () => {
    console.log("usePrintService: Starting printer scan");
    
    if (!isConnected) {
      console.log("usePrintService: Not connected. Trying to connect first...");
      const connectionSuccess = await connect();
      if (!connectionSuccess) {
        console.log("usePrintService: Could not connect for printer scan");
        return false;
      }
    }
    
    setIsScanning(true);
    try {
      console.log("usePrintService: Executing refreshPrinters");
      const success = await printService.refreshPrinters();
      
      if (success) {
        console.log("usePrintService: Printers updated successfully");
        const printers = printService.getAvailablePrinters();
        console.log("usePrintService: Printers found:", printers);
        setAvailablePrinters(printers);
        setDefaultPrinter(printService.getDefaultPrinter());
      } else {
        console.log("usePrintService: Could not update printers");
      }
      return success;
    } catch (error) {
      console.error("usePrintService: Error scanning printers", error);
      toast.error("Error searching for printers");
      return false;
    } finally {
      setIsScanning(false);
    }
  }, [isConnected, connect]);
  
  // Listen for status changes
  useEffect(() => {
    console.log("usePrintService: Setting up status change listener");
    
    const unsubscribe = printService.onStatusChange((newStatus) => {
      console.log("usePrintService: Status changed to", newStatus);
      setStatus(newStatus);
      setIsConnected(printService.isConnected());
      setAvailablePrinters(printService.getAvailablePrinters());
      setDefaultPrinter(printService.getDefaultPrinter());
    });
    
    // Auto-connect on mount (if on a relevant page)
    console.log("usePrintService: Attempting automatic connection");
    
    if (typeof window !== 'undefined') {
      // Try to connect after a short delay to allow UI to load
      const autoConnectTimer = setTimeout(() => {
        console.log("usePrintService: Attempting automatic connection after timeout");
        connect().catch(error => {
          console.error("usePrintService: Error in automatic connection", error);
        });
      }, 3000); // 3 second delay
      
      return () => {
        clearTimeout(autoConnectTimer);
        unsubscribe();
        console.log("usePrintService: Removing listener");
      };
    }
    
    return () => {
      unsubscribe();
      console.log("usePrintService: Removing listener");
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
