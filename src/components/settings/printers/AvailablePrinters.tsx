
import React from 'react';
import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestPrintButton } from '@/components/ui/printing/TestPrintButton';

interface PrinterInfo {
  name: string;
  isDefault?: boolean;
}

interface AvailablePrintersProps {
  isConnected: boolean;
  availablePrinters: PrinterInfo[];
  isConnecting: boolean;
  onShowPrinterDiagnostics: () => void;
}

export const AvailablePrinters = ({ 
  isConnected, 
  availablePrinters, 
  isConnecting,
  onShowPrinterDiagnostics
}: AvailablePrintersProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Impresoras Disponibles</h3>
      {isConnected && availablePrinters.length > 0 ? (
        <div className="space-y-2">
          {availablePrinters.map((printer, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center">
                <Printer className="h-4 w-4 mr-2 text-primary" />
                <span>{printer.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {printer.isDefault && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Predeterminada
                  </Badge>
                )}
                <TestPrintButton printerName={printer.name} />
              </div>
            </div>
          ))}
        </div>
      ) : isConnected && availablePrinters.length === 0 ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="mb-2">
              <span className="font-semibold">No se encontraron impresoras instaladas en el sistema</span>
            </div>
            <p className="text-sm">
              Esto puede ocurrir por los siguientes motivos:
            </p>
            <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
              <li>No hay impresoras instaladas en su computadora</li>
              <li>El servicio de impresión del sistema está detenido</li>
              <li>QZ Tray no tiene permisos suficientes para acceder a las impresoras</li>
            </ul>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onShowPrinterDiagnostics}
                className="text-amber-800 border-amber-300 bg-amber-100 hover:bg-amber-200"
              >
                <SettingsIcon className="h-3.5 w-3.5 mr-1.5" />
                Ejecutar Diagnóstico de Impresoras
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <p className="text-sm text-muted-foreground">
          {isConnecting ? 
            "Conectando con el sistema de impresión..." : 
            "Conecte el sistema de impresión para ver las impresoras disponibles."}
        </p>
      )}
    </div>
  );
};

export default AvailablePrinters;
