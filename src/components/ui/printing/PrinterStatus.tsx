
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  WifiOff, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Power // Using Power instead of PrinterOff
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
    scanForPrinters
  } = usePrintService();
  
  const handleToggleConnection = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  const handleScanPrinters = async () => {
    await scanForPrinters();
  };
  
  // Status icon based on connection status
  const StatusIcon = () => {
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
            <div className="inline-flex cursor-pointer">
              <Badge variant="outline" className={`${getStatusColor()} flex items-center gap-1`}>
                <StatusIcon />
                <span>{getStatusText()}</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Estado del sistema de impresión</p>
            {status === 'error' && <p className="text-xs text-red-500">Haga clic para solucionar</p>}
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
              disabled={status === 'connecting'}
            >
              {status === 'connecting' ? (
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
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Buscar Impresoras
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
