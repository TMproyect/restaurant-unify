
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, Terminal, Download } from 'lucide-react';

interface QzDiagnosticToolProps {
  onClose?: () => void;
}

export function QzDiagnosticTool({ onClose }: QzDiagnosticToolProps) {
  const [scriptLoaded, setScriptLoaded] = useState<boolean | null>(null);
  const [qzAvailable, setQzAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Función para comprobar el estado de QZ Tray
  const checkQzStatus = () => {
    setChecking(true);
    setErrorMsg(null);

    // 1. Comprobar si el script está cargado
    const qzScriptTags = document.querySelectorAll('script[src*="qz-tray"]');
    const scriptExists = qzScriptTags.length > 0;
    setScriptLoaded(scriptExists);

    // 2. Comprobar si el objeto qz está disponible
    setQzAvailable(typeof window.qz !== 'undefined');

    setChecking(false);
  };

  const loadQzScript = () => {
    try {
      // Si no existe el script, lo añadimos dinámicamente
      const existingScript = document.querySelector('script[src*="qz-tray"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = '/qz-tray.min.js';
        script.defer = true;
        script.onload = () => {
          console.log("Script QZ Tray cargado dinámicamente");
          setTimeout(checkQzStatus, 1000); // Comprobar después de un segundo
        };
        script.onerror = (e) => {
          console.error("Error al cargar script QZ Tray", e);
          setErrorMsg("No se pudo cargar el script de QZ Tray. Verifique que el archivo exista en el servidor.");
          setChecking(false);
        };
        document.head.appendChild(script);
      } else {
        setErrorMsg("El script ya está presente, pero no se ha inicializado correctamente. Intente recargar la página.");
      }
    } catch (err) {
      console.error("Error al añadir script dinámicamente", err);
      setErrorMsg(`Error al añadir script: ${err}`);
      setChecking(false);
    }
  };

  // Comprobación inicial al montar el componente
  useEffect(() => {
    checkQzStatus();
  }, []);

  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardHeader className="bg-amber-100">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Herramienta de diagnóstico QZ Tray
        </CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        <div className="space-y-4">
          <h3 className="font-medium">Estado de QZ Tray</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded-md border">
              <div className="flex items-center gap-2">
                <span>Script QZ Tray cargado:</span>
              </div>
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : scriptLoaded ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-white rounded-md border">
              <div className="flex items-center gap-2">
                <span>Objeto window.qz disponible:</span>
              </div>
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : qzAvailable ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {(!qzAvailable || !scriptLoaded) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>Problemas detectados con QZ Tray:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {!scriptLoaded && <li>El script de QZ Tray no está cargado correctamente.</li>}
                  {!qzAvailable && <li>El objeto window.qz no está disponible.</li>}
                </ul>
                <p className="mt-2">Recomendaciones:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verifique que QZ Tray esté instalado y ejecutándose</li>
                  <li>Intente recargar la página</li>
                  <li>Compruebe que el archivo qz-tray.min.js existe en el servidor</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-amber-100/50 gap-2">
        <Button variant="outline" size="sm" onClick={checkQzStatus} disabled={checking}>
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Comprobando...
            </>
          ) : (
            'Comprobar estado'
          )}
        </Button>
        
        <div className="flex gap-2">
          {!scriptLoaded && (
            <Button variant="outline" size="sm" onClick={loadQzScript} disabled={checking}>
              Cargar script
            </Button>
          )}
          
          <Button variant="default" size="sm" asChild>
            <a href="https://qz.io/download/" target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Descargar QZ Tray
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
