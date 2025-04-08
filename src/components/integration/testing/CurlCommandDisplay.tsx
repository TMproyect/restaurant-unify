
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from 'lucide-react';

interface CurlCommandDisplayProps {
  curlCommand: string;
  copyToClipboard: (text: string, message?: string) => void;
}

export const CurlCommandDisplay: React.FC<CurlCommandDisplayProps> = ({
  curlCommand,
  copyToClipboard
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Comando cURL</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Puede usar este comando cURL para probar la API desde la línea de comandos:
      </p>
      <Textarea 
        value={curlCommand}
        rows={5}
        readOnly 
        className="font-mono text-sm"
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={() => copyToClipboard(curlCommand, "Comando cURL copiado")}
      >
        <Copy className="mr-2 h-3 w-3" />
        Copiar comando
      </Button>
    </div>
  );
};
