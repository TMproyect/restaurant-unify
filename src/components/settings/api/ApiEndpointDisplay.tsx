
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpointDisplayProps {
  apiUrl: string;
}

export const ApiEndpointDisplay = ({ apiUrl }: ApiEndpointDisplayProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "URL copiada",
      description: "URL de API copiada al portapapeles"
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="api-url">URL para enviar pedidos:</Label>
      <div className="flex gap-2">
        <Input 
          id="api-url"
          value={apiUrl}
          readOnly
          className="font-mono text-sm bg-muted"
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => copyToClipboard(apiUrl)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Utilice esta URL como destino para enviar pedidos desde sistemas externos
      </p>
    </div>
  );
};
