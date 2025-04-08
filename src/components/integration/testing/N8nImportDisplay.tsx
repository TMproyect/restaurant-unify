
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from 'lucide-react';

interface N8nImportDisplayProps {
  n8nImportCommand: string;
  copyToClipboard: (text: string, message?: string) => void;
}

export const N8nImportDisplay: React.FC<N8nImportDisplayProps> = ({
  n8nImportCommand,
  copyToClipboard
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium">n8n - Texto para Importación Directa</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Copie y pegue este texto en la ventana de importación de n8n:
      </p>
      <Textarea 
        value={n8nImportCommand}
        rows={10}
        readOnly 
        className="font-mono text-sm"
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={() => copyToClipboard(n8nImportCommand, "Texto para importación en n8n copiado")}
      >
        <Copy className="mr-2 h-3 w-3" />
        Copiar para n8n
      </Button>
    </div>
  );
};
