
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { usePrintService } from '@/hooks/use-print-service';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PrinterStatusProps {
  showConnectButton?: boolean;
  compact?: boolean;
}

export function PrinterStatus({ 
  showConnectButton = true,
  compact = false 
}: PrinterStatusProps) {
  const { 
    status, 
    isConnected, 
    connect, 
    disconnect,
    defaultPrinter 
  } = usePrintService();
  
  const handleToggleConnection = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
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
            <Badge variant="outline" className={`${getStatusColor()} flex items-center gap-1 cursor-default`}>
              <StatusIcon />
              <span>{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Estado del sistema de impresión</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <StatusIcon />
        <span className="text-sm">{getStatusText()}</span>
      </div>
      
      {showConnectButton && (
        <Button 
          size="sm" 
          variant={isConnected ? "outline" : "default"}
          onClick={handleToggleConnection}
          disabled={status === 'connecting'}
          className="ml-2"
        >
          {status === 'connecting' ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Conectando
            </>
          ) : isConnected ? 'Desconectar' : 'Conectar'}
        </Button>
      )}
    </div>
  );
}
