
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ApiKeyDisplay } from './ApiKeyDisplay';
import { ApiKeyStatusAlert } from './ApiKeyStatusAlert';
import { ApiKeyVisibilityWarning } from './ApiKeyVisibilityWarning';
import { ApiKeyConfirmDialog } from './ApiKeyConfirmDialog';
import { 
  generateSecureApiKey, 
  saveApiKeyToDatabase,
  testApiKey
} from './utils/apiKeyUtils';

interface ApiKeySectionProps {
  apiKey: string | null;
  onApiKeyChange: (key: string | null) => void;
}

export const ApiKeySection = ({ apiKey, onApiKeyChange }: ApiKeySectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [testStatus, setTestStatus] = useState<null | 'success' | 'error'>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const initiateKeyGeneration = () => {
    setShowConfirmDialog(true);
  };

  const generateNewApiKey = async () => {
    setIsLoading(true);
    try {
      // Generate secure API key
      const newApiKey = generateSecureApiKey();
      
      // Save the new key to the database
      const { error } = await saveApiKeyToDatabase(newApiKey);

      if (error) {
        console.error('Error saving API key:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la nueva clave API",
          variant: "destructive"
        });
        setTestStatus('error');
        setTestMessage("Error al guardar la clave API en la base de datos");
        return;
      }

      console.log("API key saved successfully to database");
      
      // Only show the key temporarily
      onApiKeyChange(newApiKey);
      setIsVisible(true);
      setTestStatus(null);
      setTestMessage(null);
      
      // Hide automatically after 30 seconds
      setTimeout(() => {
        setIsVisible(false);
        // Update state to 'exists' after hiding
        onApiKeyChange('exists');
      }, 30000);

      toast({
        title: "Éxito",
        description: "Nueva clave API generada. Se ocultará en 30 segundos",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar la clave",
        variant: "destructive"
      });
      setTestStatus('error');
      setTestMessage("Error inesperado al generar la clave API");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey || apiKey === 'exists') {
      toast({
        title: "Error",
        description: "No hay una clave API visible para probar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTestStatus(null);
    setTestMessage(null);

    const result = await testApiKey(apiKey);
    setTestStatus(result.status);
    setTestMessage(result.message);
    
    toast({
      title: result.status === 'success' ? "Éxito" : "Error",
      description: result.message,
      variant: result.status === 'success' ? "default" : "destructive"
    });
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="api-key">Clave API Secreta:</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="sr-only">Ayuda</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Esta clave secreta permite a sistemas externos enviar pedidos a tu POS. Genérala y cópiala en tu sistema externo (ej: n8n). Por seguridad, solo se muestra una vez después de generarla.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <ApiKeyDisplay 
        apiKey={apiKey} 
        isVisible={isVisible} 
        onVisibilityChange={setIsVisible} 
      />
      
      <div className="flex gap-2 mt-2">
        <Button
          variant="default"
          onClick={initiateKeyGeneration}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generar nueva clave
            </>
          )}
        </Button>
        
        {apiKey && isVisible && (
          <Button
            variant="outline"
            onClick={handleTestApiKey}
            disabled={isLoading}
          >
            Probar clave
          </Button>
        )}
      </div>

      <ApiKeyVisibilityWarning isVisible={!!(apiKey && isVisible)} />
      <ApiKeyStatusAlert status={testStatus} message={testMessage} />
      <ApiKeyConfirmDialog 
        open={showConfirmDialog} 
        onOpenChange={setShowConfirmDialog}
        onConfirm={generateNewApiKey}
      />
    </div>
  );
};
