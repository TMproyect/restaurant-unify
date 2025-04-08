
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CurlCommandDisplayProps {
  curlCommand: string;
  copyToClipboard: (text: string, message?: string) => void;
}

export const CurlCommandDisplay: React.FC<CurlCommandDisplayProps> = ({
  curlCommand,
  copyToClipboard
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium">cURL</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Utilice el siguiente comando cURL para enviar un pedido de prueba:
      </p>
      <Textarea 
        value={curlCommand}
        rows={8}
        readOnly 
        className="font-mono text-sm"
      />
      <div className="flex mt-2 space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => copyToClipboard(curlCommand, "Comando cURL copiado")}
        >
          <Copy className="mr-2 h-3 w-3" />
          Copiar comando
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="mr-2 h-3 w-3" />
              ¿Cómo importar en n8n?
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-medium">Importar en n8n</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>En n8n, añada un nodo "HTTP Request"</li>
                <li>Haga clic en el botón <strong>"Import cURL"</strong></li>
                <li>Pegue el comando cURL copiado</li>
                <li>Haga clic en "Import"</li>
              </ol>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
