
import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ExternalLink, RefreshCw, HelpCircle } from 'lucide-react';
import { QzDiagnosticTool } from './QzDiagnosticTool';
import printService from '@/services/printing/printService';
import { toast } from 'sonner';

export function PrinterTroubleshooting() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await printService.connect();
      if (result) {
        toast.success("Conexión exitosa al sistema de impresión");
      } else {
        toast.error("No se pudo conectar al sistema de impresión");
      }
    } catch (error) {
      console.error('Error connecting to print system:', error);
      toast.error("Error al conectar con el sistema de impresión");
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Solución de Problemas de Impresión</CardTitle>
        <CardDescription>
          Guía para resolver los problemas más comunes con el sistema de impresión
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            El sistema utiliza QZ Tray para comunicarse con sus impresoras locales. 
            Esta guía le ayudará a resolver los problemas más comunes.
          </AlertDescription>
        </Alert>
        
        {showDiagnostics && (
          <div className="mb-4">
            <QzDiagnosticTool onClose={() => setShowDiagnostics(false)} />
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            {showDiagnostics ? 'Ocultar Diagnóstico' : 'Ejecutar Diagnóstico'}
          </Button>
          
          <Button 
            variant="default"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
            {isConnecting ? 'Conectando...' : 'Reintentar Conexión'}
          </Button>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base">
              No puedo conectar con QZ Tray
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>Verifique los siguientes puntos:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Asegúrese de que QZ Tray esté instalado en su computadora.
                  <div className="mt-1">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://qz.io/download/" target="_blank" rel="noreferrer">
                        Descargar QZ Tray <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </li>
                <li>
                  Verifique que QZ Tray esté en ejecución (busque el icono en la bandeja del sistema).
                </li>
                <li>
                  Si está usando un navegador diferente, asegúrese de haber configurado el certificado de QZ Tray.
                </li>
                <li>
                  Reinicie QZ Tray y vuelva a intentar la conexión.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base">
              No se encuentra mi impresora
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>Si su impresora no aparece en la lista:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Verifique que la impresora esté instalada correctamente en su sistema operativo.
                </li>
                <li>
                  Asegúrese de que la impresora esté encendida y conectada a su computadora.
                </li>
                <li>
                  Intente usar el botón "Buscar Impresoras" para refrescar la lista.
                </li>
                <li>
                  Reinicie QZ Tray y actualice la página.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base">
              El ticket no se imprime correctamente
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>Si los tickets se imprimen con caracteres extraños o formato incorrecto:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Verifique que esté usando el controlador de impresora correcto.
                </li>
                <li>
                  Las impresoras térmicas requieren comandos ESC/POS específicos.
                </li>
                <li>
                  Utilice el botón "Imprimir Prueba" para verificar la comunicación con la impresora.
                </li>
                <li>
                  Asegúrese de que el modelo de impresora sea compatible con los comandos que se están enviando.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-base">
              Problemas con permisos de Java
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p>QZ Tray se basa en Java y puede tener problemas de permisos:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Asegúrese de haber aceptado los permisos cuando QZ Tray se inició por primera vez.
                </li>
                <li>
                  En macOS, verifique que haya dado permisos de accesibilidad a QZ Tray.
                </li>
                <li>
                  En Windows, pruebe ejecutar QZ Tray como administrador.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
