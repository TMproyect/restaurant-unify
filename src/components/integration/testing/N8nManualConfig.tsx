
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';

interface N8nManualConfigProps {
  apiEndpoint: string;
}

export const N8nManualConfig: React.FC<N8nManualConfigProps> = ({
  apiEndpoint
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium">n8n</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Configuración manual para n8n:
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Utilice el nodo "HTTP Request"</li>
        <li>Establezca el método a POST</li>
        <li>URL: {apiEndpoint}</li>
        <li>Añada el encabezado <code className="px-1 py-0.5 bg-muted rounded font-mono">x-api-key</code> con el valor de su clave API</li>
        <li>Añada el encabezado <code className="px-1 py-0.5 bg-muted rounded font-mono">Content-Type</code> con el valor <code className="px-1 py-0.5 bg-muted rounded font-mono">application/json</code></li>
        <li>En el cuerpo, proporcione un JSON con la estructura mostrada anteriormente</li>
      </ol>
      <Button 
        variant="outline" 
        size="sm"
        className="mt-4"
        asChild
      >
        <a href="https://n8n.io/integrations/http-request/" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          Documentación de n8n para HTTP Request
        </a>
      </Button>
    </div>
  );
};
