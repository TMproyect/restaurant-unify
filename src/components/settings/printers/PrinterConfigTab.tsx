
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { QzDiagnosticTool } from '@/components/ui/printing/QzDiagnosticTool';
import { PrinterDiagnosticTool } from '@/components/ui/printing/diagnostic/PrinterDiagnosticTool';
import QzConnectionGuide from './QzConnectionGuide';
import AvailablePrinters from './AvailablePrinters';

interface PrinterConfigTabProps {
  status: string;
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  availablePrinters: Array<{ name: string; isDefault?: boolean }>;
  showQzDiagnostics: boolean;
  showPrinterDiagnostics: boolean;
  setShowQzDiagnostics: (show: boolean) => void;
  setShowPrinterDiagnostics: (show: boolean) => void;
  handleConnect: () => void;
  handleRefreshPrinters: () => void;
}

export const PrinterConfigTab = ({
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
}: PrinterConfigTabProps) => {
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
          handleConnect={handleConnect} 
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
            onClick={handleRefreshPrinters}
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
