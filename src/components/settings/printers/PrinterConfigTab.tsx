
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { QzDiagnosticTool } from '@/components/ui/printing/QzDiagnosticTool';
import { PrinterDiagnosticTool } from '@/components/ui/printing/diagnostic/PrinterDiagnosticTool';
import QzConnectionGuide from './QzConnectionGuide';
import AvailablePrinters from './AvailablePrinters';
import { PrinterConfigProps } from '@/types/printer.types';
import { handleError } from '@/utils/errorHandling';

export const PrinterConfigTab: React.FC<PrinterConfigProps> = ({
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
}) => {
  const onRefreshPrinters = async () => {
    try {
      await handleRefreshPrinters();
    } catch (error) {
      handleError(error, 'PrinterConfigTab');
    }
  };

  const onConnect = async () => {
    try {
      await handleConnect();
    } catch (error) {
      handleError(error, 'PrinterConfigTab');
    }
  };

  return (
    <>
      {status === 'error' && showQzDiagnostics && (
        <QzDiagnosticTool onClose={() => setShowQzDiagnostics(false)} />
      )}
      
      {isConnected && availablePrinters.length === 0 && showPrinterDiagnostics && (
        <PrinterDiagnosticTool onClose={() => setShowPrinterDiagnostics(false)} />
      )}

      {status === 'error' && (
        <QzConnectionGuide 
          handleConnect={onConnect} 
          isConnecting={isConnecting} 
        />
      )}
      
      <div>
        <h3 className="text-sm font-medium mb-2">Estado del Sistema</h3>
        <p className="text-sm text-muted-foreground mb-4">
          El sistema de impresión QZ Tray permite imprimir directamente a impresoras locales desde el navegador. 
          Debe estar instalado y ejecutándose en esta computadora.
        </p>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefreshPrinters}
            disabled={!isConnected || isScanning}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? "Buscando..." : "Buscar Impresoras"}
          </Button>
        </div>
      </div>
      
      <AvailablePrinters 
        isConnected={isConnected}
        availablePrinters={availablePrinters}
        isConnecting={isConnecting}
        onShowPrinterDiagnostics={() => setShowPrinterDiagnostics(true)}
      />
    </>
  );
};

export default PrinterConfigTab;
