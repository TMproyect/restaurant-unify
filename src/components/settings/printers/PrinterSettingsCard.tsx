
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, AlertTriangle } from 'lucide-react';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { PrinterStationsConfig } from '@/components/ui/printing/PrinterStationsConfig';
import { PrintJobMonitor } from '@/components/ui/printing/PrintJobMonitor';
import { PrinterTroubleshooting } from '@/components/ui/printing/PrinterTroubleshooting';
import PrinterConfigTab from './PrinterConfigTab';

interface PrinterSettingsCardProps {
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

export const PrinterSettingsCard = ({
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
}: PrinterSettingsCardProps) => {
  const [activePrinterTab, setActivePrinterTab] = useState('config');

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle>Sistema de Impresión</CardTitle>
          <CardDescription>
            Configuración del sistema de impresión QZ Tray
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <PrinterStatus showHelp={true} />
          {status === 'error' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowQzDiagnostics(!showQzDiagnostics)}
              className="text-amber-600 border-amber-300 hover:text-amber-700 hover:border-amber-400"
            >
              <AlertTriangle className="mr-2 h-3 w-3" />
              {showQzDiagnostics ? "Ocultar diagnóstico" : "Diagnóstico de conexión"}
            </Button>
          )}
          {isConnected && availablePrinters.length === 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPrinterDiagnostics(!showPrinterDiagnostics)}
              className="text-amber-600 border-amber-300 hover:text-amber-700 hover:border-amber-400"
            >
              <Printer className="mr-2 h-3 w-3" />
              {showPrinterDiagnostics ? "Ocultar diagnóstico" : "Diagnóstico de impresoras"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activePrinterTab} onValueChange={setActivePrinterTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="stations">Estaciones</TabsTrigger>
            <TabsTrigger value="jobs">Trabajos de Impresión</TabsTrigger>
            <TabsTrigger value="troubleshoot">Solución de Problemas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-6">
            <PrinterConfigTab 
              status={status}
              isConnected={isConnected}
              isConnecting={isConnecting}
              isScanning={isScanning}
              availablePrinters={availablePrinters}
              showQzDiagnostics={showQzDiagnostics}
              showPrinterDiagnostics={showPrinterDiagnostics}
              setShowQzDiagnostics={setShowQzDiagnostics}
              setShowPrinterDiagnostics={setShowPrinterDiagnostics}
              handleConnect={handleConnect}
              handleRefreshPrinters={handleRefreshPrinters}
            />
          </TabsContent>
          
          <TabsContent value="stations">
            {isConnected ? (
              <PrinterStationsConfig />
            ) : (
              <div className="text-center py-8">
                <Printer className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">Sistema de impresión desconectado</h3>
                <p className="text-muted-foreground mb-4">Conecte el sistema de impresión para configurar las estaciones</p>
                <Button onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? "Conectando..." : "Conectar Sistema de Impresión"}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Trabajos de Impresión</CardTitle>
                <CardDescription>
                  Monitoree los trabajos de impresión recientes y su estado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PrintJobMonitor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="troubleshoot">
            <PrinterTroubleshooting />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
        <p>QZ Tray debe estar instalado en cada computadora que necesite imprimir tickets o comandas.</p>
      </CardFooter>
    </Card>
  );
};

export default PrinterSettingsCard;
