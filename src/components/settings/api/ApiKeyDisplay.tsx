
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeOff, Eye, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDisplayProps {
  apiKey: string | null;
}

export const ApiKeyDisplay: React.FC<ApiKeyDisplayProps> = ({ apiKey }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (!apiKey || apiKey === 'exists') return;
    
    navigator.clipboard.writeText(apiKey)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copiado",
          description: "Clave API copiada al portapapeles",
        });
        
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

  if (apiKey) {
    return (
      <div className="mt-2 relative">
        <Input
          id="api-key"
          value={isVisible ? apiKey : "****************************************"}
          readOnly
          className="pr-20 font-mono bg-muted"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(!isVisible)}
            className="h-full rounded-l-none"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="h-full rounded-l-none"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md">
        No hay clave configurada
      </div>
    );
  }
};
