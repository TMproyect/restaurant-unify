
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Info,
  Printer,
  Settings
} from 'lucide-react';
import { PrinterSystemCheck } from '@/services/printing/diagnostic/printerSystemCheck';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface DiagnosticToolProps {
  onClose?: () => void;
}

export function PrinterDiagnosticTool({ onClose }: DiagnosticToolProps) {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await PrinterSystemCheck.runDiagnostics();
      console.log('Printer diagnostics completed:', results);
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run diagnostics when component mounts
  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card className="mb-4 max-w-3xl mx-auto">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Diagnóstico del Sistema de Impresión
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostics}
          disabled={isRunning}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRunning && (
          <Alert>
            <AlertDescription className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Ejecutando diagnóstico del sistema de impresión...
            </AlertDescription>
          </Alert>
        )}
        
        {diagnosticResults && !isRunning && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded-md">
                  <span>QZ Tray disponible</span>
                  {diagnosticResults.results.qzAvailable ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex justify-between items-center p-2 border rounded-md">
                  <span>Acceso a impresoras</span>
                  {diagnosticResults.results.printerAccess.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex justify-between items-center p-2 border rounded-md">
                  <span>Servicio de impresión</span>
                  {diagnosticResults.results.printService.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="p-4 border rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl font-bold mb-2 flex items-center">
                  <Printer className="h-8 w-8 mr-2" />
                  {diagnosticResults.results.printersFound}
                </div>
                <p className="text-center text-sm text-gray-500">
                  {diagnosticResults.results.printersFound === 1 ? 'Impresora encontrada' : 'Impresoras encontradas'}
                </p>
                {diagnosticResults.results.printersFound === 0 && (
                  <span className="inline-flex items-center mt-2 text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    No se encontraron impresoras en el sistema
                  </span>
                )}
              </div>
            </div>
            
            {diagnosticResults.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Recomendaciones</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {diagnosticResults.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Accordion type="single" collapsible>
              <AccordionItem value="troubleshooting">
                <AccordionTrigger>
                  <span className="text-sm font-medium flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Solución de problemas comunes
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <h4 className="font-medium">Cuando no se encuentran impresoras:</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Verifique que tenga impresoras instaladas en su sistema operativo</li>
                      <li>Asegúrese de que las impresoras estén encendidas y conectadas</li>
                      <li>Reinicie el servicio de impresión del sistema:
                        <ul className="list-disc pl-5 mt-1">
                          <li><strong>Windows:</strong> Ejecute <code>services.msc</code>, busque "Print Spooler", clic derecho y Reiniciar</li>
                          <li><strong>Mac:</strong> Ejecute <code>sudo cupsd restart</code> en Terminal</li>
                          <li><strong>Linux:</strong> Ejecute <code>sudo systemctl restart cups</code></li>
                        </ul>
                      </li>
                      <li>Pruebe imprimir desde otras aplicaciones para confirmar que sus impresoras funcionan</li>
                      <li>Ejecute QZ Tray como administrador o con privilegios elevados</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
        
        {!diagnosticResults && !isRunning && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No se pudo ejecutar el diagnóstico. Intente nuevamente.
            </AlertDescription>
          </Alert>
        )}
        
        {onClose && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
