
import { useState, useEffect, useCallback, useMemo } from 'react';
import usePrintService from './use-print-service';
import { handleError } from '@/utils/errorHandling';

export const usePrinterSettings = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showQzDiagnostics, setShowQzDiagnostics] = useState(false);
  const [showPrinterDiagnostics, setShowPrinterDiagnostics] = useState(false);
  
  const printService = usePrintService();
  const { availablePrinters, isConnected, connect, scanForPrinters, status } = printService;

  useEffect(() => {
    if (status === 'connected') {
      setIsConnecting(false);
    } else if (status === 'error' && isConnecting) {
      setIsConnecting(false);
    }
  }, [status, isConnecting]);

  const handleRefreshPrinters = useCallback(async () => {
    console.log("usePrinterSettings: Iniciando escaneo de impresoras");
    setIsScanning(true);
    try {
      await scanForPrinters();
      console.log("usePrinterSettings: Escaneo de impresoras completado");
      
      if (availablePrinters.length === 0) {
        setShowPrinterDiagnostics(true);
      }
    } catch (error) {
      console.error("usePrinterSettings: Error al escanear impresoras", error);
      handleError(error, 'usePrinterSettings - Refresh Printers');
    } finally {
      setIsScanning(false);
    }
  }, [scanForPrinters, availablePrinters.length]);

  const handleConnect = useCallback(async () => {
    console.log("usePrinterSettings: Iniciando conexión");
    setIsConnecting(true);
    try {
      const result = await connect();
      console.log("usePrinterSettings: Resultado de conexión:", result ? "Exitoso" : "Fallido");
      
      if (result) {
        if (availablePrinters.length === 0) {
          setTimeout(() => {
            setShowPrinterDiagnostics(true);
          }, 1000);
        }
      } else {
        setShowQzDiagnostics(true);
      }
    } catch (error) {
      console.error("usePrinterSettings: Error al conectar", error);
      handleError(error, 'usePrinterSettings - Connect');
      setIsConnecting(false);
      setShowQzDiagnostics(true);
    }
  }, [connect, availablePrinters.length]);

  const printerConfig = useMemo(() => ({
    status,
    isConnected,
    isConnecting,
    isScanning,
    availablePrinters,
    showQzDiagnostics,
    showPrinterDiagnostics,
    setShowQzDiagnostics,
    setShowPrinterDiagnostics,
    handleConnect,
    handleRefreshPrinters
  }), [
    status,
    isConnected,
    isConnecting,
    isScanning,
    availablePrinters,
    showQzDiagnostics,
    showPrinterDiagnostics,
    handleConnect,
    handleRefreshPrinters
  ]);

  return printerConfig;
};
