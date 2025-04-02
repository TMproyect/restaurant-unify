
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  WifiOff, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Power
} from 'lucide-react';
import { usePrintService } from '@/hooks/use-print-service';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PrinterStatusProps {
  showConnectButton?: boolean;
  compact?: boolean;
  showHelp?: boolean;
}

export function PrinterStatus({ 
  showConnectButton = true,
  compact = false,
  showHelp = false
}: PrinterStatusProps) {
  const { 
    status, 
    isConnected, 
    connect, 
    disconnect,
    defaultPrinter,
    scanForPrinters,
    isScanning
  } = usePrintService();
  
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Efecto para resetear el estado de conexión cuando cambia el status
  useEffect(() => {
    if (status !== 'connecting' && isConnecting) {
      console.log("🖨️ PrinterStatus: Reseteando estado de conexión porque status cambió a:", status);
      setIsConnecting(false);
    }
  }, [status, isConnecting]);
  
  const handleToggleConnection = async () => {
    console.log("🖨️ PrinterStatus: Intentando cambiar estado de conexión. Estado actual:", status);
    
    try {
      if (isConnected) {
        console.log("🖨️ PrinterStatus: Iniciando desconexión...");
        await disconnect();
        console.log("🖨️ PrinterStatus: Desconexión completada");
      } else {
        console.log("🖨️ PrinterStatus: Iniciando conexión manual...");
        setIsConnecting(true);
        const result = await connect();
        console.log("🖨️ PrinterStatus: Resultado de conexión:", result ? "Exitoso" : "Fallido");
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("🖨️ PrinterStatus: Error al cambiar estado de conexión:", error);
      setIsConnecting(false);
    }
  };

  const handleScanPrinters = async () => {
    console.log("🖨️ PrinterStatus: Iniciando escaneo de impresoras...");
    try {
      const result = await scanForPrinters();
      console.log("🖨️ PrinterStatus: Resultado de escaneo:", result ? "Exitoso" : "Fallido");
    } catch (error) {
      console.error("🖨️ PrinterStatus: Error al escanear impresoras:", error);
    }
  };
  
  // Click handler para cuando está en modo compacto
  const handleCompactClick = () => {
    console.log("🖨️ PrinterStatus: Click en estado compacto. Estado actual:", status);
    if (status === 'error' || status === 'disconnected') {
      console.log("🖨️ PrinterStatus: Intentando conectar desde modo compacto...");
      setIsConnecting(true);
      connect()
        .then(result => {
          console.log("🖨️ PrinterStatus: Resultado de conexión desde compacto:", result ? "Exitoso" : "Fallido");
          setIsConnecting(false);
        })
        .catch(err => {
          console.error("🖨️ PrinterStatus: Error al conectar desde compacto:", err);
          setIsConnecting(false);
        });
    }
  };
  
  // Status icon based on connection status
  const StatusIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (status) {
      case 'connected':
        return <Printer className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Printer className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Status text based on connection status
  const getStatusText = () => {
    if (isConnecting) {
      return 'Conectando...';
    }
    
    switch (status) {
      case 'connected':
        return compact ? 'Conectado' : `Impresora conectada${defaultPrinter ? ` (${defaultPrinter})` : ''}`;
      case 'disconnected':
        return 'Desconectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Estado desconocido';
    }
  };
  
  // Status color based on connection status
  const getStatusColor = () => {
    if (isConnecting) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'connecting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="inline-flex cursor-pointer" 
              onClick={handleCompactClick}
              aria-label="Estado del sistema de impresión"
            >
              <Badge variant="outline" className={`${getStatusColor()} flex items-center gap-1`}>
                <StatusIcon />
                <span>{getStatusText()}</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Estado del sistema de impresión</p>
            {(status === 'error' || status === 'disconnected') && <p className="text-xs text-red-500">Haga clic para solucionar</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <StatusIcon />
          <span className="text-sm">{getStatusText()}</span>
        </div>
        
        {showConnectButton && (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={isConnected ? "outline" : "default"}
              onClick={handleToggleConnection}
              disabled={status === 'connecting' || isConnecting}
              className="relative"
            >
              {(status === 'connecting' || isConnecting) ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Conectando
                </>
              ) : isConnected ? (
                <>
                  <Power className="mr-1 h-3 w-3" />
                  Desconectar
                </>
              ) : (
                <>
                  <Printer className="mr-1 h-3 w-3" />
                  Conectar
                </>
              )}
            </Button>
            
            {isConnected && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleScanPrinters}
                disabled={isScanning}
              >
                <RefreshCw className={`mr-1 h-3 w-3 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? "Buscando..." : "Buscar Impresoras"}
              </Button>
            )}
          </div>
        )}
      </div>
      
      {showHelp && status === 'error' && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">No se pudo conectar con QZ Tray. Verifique que:</p>
            <ol className="text-sm list-decimal pl-5 mt-1">
              <li>QZ Tray esté instalado en su computadora</li>
              <li>QZ Tray esté ejecutándose (busque el icono en la bandeja del sistema)</li>
              <li>Su navegador permita conexiones con aplicaciones locales</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
