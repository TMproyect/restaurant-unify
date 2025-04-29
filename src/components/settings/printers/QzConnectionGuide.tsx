
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';

interface QzConnectionGuideProps {
  handleConnect: () => void;
  isConnecting: boolean;
}

const QZ_DOWNLOAD_LINK = "https://qz.io/download/";

export const QzConnectionGuide = ({ handleConnect, isConnecting }: QzConnectionGuideProps) => {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">¿Cómo conectar QZ Tray?</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Descargue e instale QZ Tray</strong> en su computadora 
            <div className="mt-1">
              <Button variant="outline" size="sm" asChild>
                <a href={QZ_DOWNLOAD_LINK} target="_blank" rel="noreferrer">
                  <Download className="h-3 w-3 mr-1" />
                  Descargar QZ Tray
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </li>
          <li className="pt-1">
            <strong>Ejecute QZ Tray</strong> - busque la aplicación en su computadora y ábrala
          </li>
          <li className="pt-1">
            <strong>Verifique que QZ Tray esté en ejecución</strong> - Busque el icono en la bandeja del sistema (junto al reloj)
            <div className="mt-2 flex justify-center">
              <img 
                src="/lovable-uploads/455e7883-ebf8-4f65-96a0-bb0292806174.png" 
                alt="QZ Tray en ejecución" 
                className="border rounded-md p-1 shadow-sm"
                style={{ maxWidth: '300px' }}
              />
            </div>
          </li>
          <li className="pt-2">
            <strong>Intente conectar</strong> - Una vez que QZ Tray esté en ejecución, puede intentar conectarse
            <div className="mt-1">
              <Button 
                variant="default" 
                size="sm"
                onClick={handleConnect}
                disabled={isConnecting}
                className="gap-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3 w-3" />
                    Conectar con QZ Tray
                  </>
                )}
              </Button>
            </div>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
};

export default QzConnectionGuide;
