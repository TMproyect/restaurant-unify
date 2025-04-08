
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
  const [testStatus, setTestStatus] = useState<null | 'success' | 'error'>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
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

      console.log("Generando nueva API key:", newApiKey.substring(0, 4) + "****" + newApiKey.substring(newApiKey.length - 4));
      
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
        setTestStatus('error');
        setTestMessage("Error al guardar la clave API en la base de datos");
        return;
      }

      console.log("API key guardada exitosamente en la base de datos");
      
      // Solo mostramos la clave temporalmente
      onApiKeyChange(newApiKey);
      setIsVisible(true);
      setTestStatus(null);
      setTestMessage(null);
      
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
      setTestStatus('error');
      setTestMessage("Error inesperado al generar la clave API");
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

  const testApiKey = async () => {
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

    try {
      const projectId = 'imcxvnivqrckgjrimzck';
      const testEndpoint = `https://${projectId}.supabase.co/functions/v1/ingresar-pedido`;
      
      // Test payload más simple para reducir posibles errores
      const testPayload = {
        nombre_cliente: "Cliente de Prueba API",
        numero_mesa: "1",
        items_pedido: [
          {
            sku_producto: "TEST-SKU",
            cantidad: 1,
            precio_unitario: 10.0
          }
        ],
        total_pedido: 10.0
      };

      console.log("Realizando prueba de la API key:", apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length - 4));
      console.log("Endpoint:", testEndpoint);
      console.log("Payload:", JSON.stringify(testPayload));
      
      // Construir y mostrar las cabeceras para depuración
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      };
      console.log("Cabeceras enviadas:", JSON.stringify(headers));
      
      const response = await fetch(testEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(testPayload)
      });

      console.log("Status de la respuesta:", response.status);
      
      // Obtener el texto de la respuesta primero para depuración
      const responseText = await response.text();
      console.log("Texto de respuesta completo:", responseText);
      
      // Intentar analizar como JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Respuesta parseada:", result);
      } catch (jsonError) {
        console.error("Error al parsear la respuesta como JSON:", jsonError);
        result = { error: `No se pudo leer la respuesta como JSON: ${responseText}` };
      }
      
      if (response.ok) {
        setTestStatus('success');
        setTestMessage("La clave API funciona correctamente");
        toast({
          title: "Éxito",
          description: "La clave API funciona correctamente",
        });
      } else {
        setTestStatus('error');
        const errorDetail = result.error || result.message || "Respuesta inválida";
        setTestMessage(`Error: ${errorDetail}`);
        toast({
          title: "Error",
          description: errorDetail,
          variant: "destructive"
        });
        
        if (result.details) {
          console.error("Detalles del error:", result.details);
        }
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestStatus('error');
      setTestMessage(`Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la función Edge de Supabase",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
        
        {apiKey && isVisible && (
          <Button
            variant="outline"
            onClick={testApiKey}
            disabled={isLoading}
          >
            Probar clave
          </Button>
        )}
      </div>

      {apiKey && isVisible && (
        <Alert className="mt-4 border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-600">
            <strong>¡Importante!</strong> Copia y guarda esta clave ahora. Por seguridad, no se mostrará de nuevo automáticamente.
          </AlertDescription>
        </Alert>
      )}

      {testStatus && (
        <Alert className={`mt-4 ${
          testStatus === 'success' 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
          }`}>
          <AlertDescription className={`${
            testStatus === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {testMessage}
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
