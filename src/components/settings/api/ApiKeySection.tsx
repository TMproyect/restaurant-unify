
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Copy, EyeOff, RefreshCw, Check, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ApiKeySectionProps {
  apiKey: string | null;
  onApiKeyChange: (key: string | null) => void;
}

export const ApiKeySection = ({ apiKey, onApiKeyChange }: ApiKeySectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const initiateKeyGeneration = () => {
    setShowConfirmDialog(true);
  };

  const generateNewApiKey = async () => {
    setIsLoading(true);
    try {
      // Generar una clave API segura (32 caracteres, alfanuméricos)
      const randomBytes = new Uint8Array(24);
      window.crypto.getRandomValues(randomBytes);
      const newApiKey = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Guardar la nueva clave en la base de datos
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key: 'external_api_key',
          value: newApiKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) {
        console.error('Error saving API key:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la nueva clave API",
          variant: "destructive"
        });
        return;
      }

      // Solo mostramos la clave temporalmente
      onApiKeyChange(newApiKey);
      setIsVisible(true);
      
      // Ocultar automáticamente después de 30 segundos
      setTimeout(() => {
        setIsVisible(false);
        // Actualiza el estado a 'exists' después de ocultar
        onApiKeyChange('exists');
      }, 30000);

      toast({
        title: "Éxito",
        description: "Nueva clave API generada. Se ocultará en 30 segundos",
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar la clave",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const copyToClipboard = () => {
    if (!apiKey || apiKey === 'exists') return;
    
    navigator.clipboard.writeText(apiKey)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copiado",
          description: "Clave API copiada al portapapeles",
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
      
      {apiKey && isVisible ? (
        <div className="mt-2 relative">
          <Input
            id="api-key"
            value={apiKey}
            readOnly
            className="pr-20 font-mono bg-muted"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-full rounded-l-none"
            >
              <EyeOff className="h-4 w-4" />
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
      ) : (
        <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md">
          {apiKey === 'exists' ? "****************************************" : "No hay clave configurada"}
        </div>
      )}
      
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
      </div>

      {apiKey && isVisible && (
        <Alert className="mt-4 border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-600">
            <strong>¡Importante!</strong> Copia y guarda esta clave ahora. Por seguridad, no se mostrará de nuevo automáticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Diálogo de confirmación para generación de nueva clave */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Regenerar clave API?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Regenerar la clave API invalidará la conexión existente y deberás actualizarla en sistemas externos como n8n.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={generateNewApiKey}>
              Sí, Generar Nueva Clave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
