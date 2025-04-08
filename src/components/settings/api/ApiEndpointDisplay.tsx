
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpointDisplayProps {
  apiUrl: string;
}

export const ApiEndpointDisplay = ({ apiUrl }: ApiEndpointDisplayProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (!apiUrl) return;
    
    navigator.clipboard.writeText(apiUrl)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copiado",
          description: "URL copiada al portapapeles",
        });
        
        // Resetear el estado "copiado" después de 2 segundos
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive"
        });
      });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">URL del Endpoint:</div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" size="sm" className="h-5 px-0 text-muted-foreground">
              Requerimientos de autenticación
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Cabeceras HTTP Requeridas</h4>
              <ul className="space-y-1">
                <li className="flex items-center text-sm">
                  <span className="font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">Content-Type</span>
                  <span className="mx-2">=</span>
                  <span className="font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">application/json</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="font-mono bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">x-api-key</span>
                  <span className="mx-2">=</span>
                  <span className="font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">su_clave_api</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Todas las solicitudes deben incluir estas cabeceras. La clave API se genera en la sección "Clave API".
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      <div className="flex">
        <div className="flex-1 rounded-l-md bg-muted p-2 font-mono text-sm overflow-x-auto whitespace-nowrap">
          {apiUrl}
        </div>
        <Button
          onClick={copyToClipboard}
          size="icon"
          variant="ghost"
          className="rounded-l-none"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Utilice esta URL como destino para enviar pedidos desde sistemas externos
      </p>
    </div>
  );
};
