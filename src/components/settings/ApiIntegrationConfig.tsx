
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, RefreshCw, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export const ApiIntegrationConfig = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  // Establecer la URL base para la API Edge Function
  useEffect(() => {
    const projectId = 'imcxvnivqrckgjrimzck';
    setApiUrl(`https://${projectId}.supabase.co/functions/v1/ingresar-pedido`);
  }, []);

  // Verifica si existe una clave API configurada, pero no la muestra
  const fetchApiKeyExistence = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'external_api_key')
        .single();

      if (error) {
        console.error('Error verificando la existencia de la clave API:', error);
        return;
      }

      // Solo guardamos el estado de si existe una clave, no la clave en sí
      if (data?.value) {
        setApiKey('exists');
      } else {
        setApiKey(null);
      }
    } catch (error) {
      console.error('Error inesperado al verificar la clave API:', error);
    }
  };

  // Cargar al inicio solo para verificar si existe una clave
  useEffect(() => {
    fetchApiKeyExistence();
  }, []);

  // Inicia el proceso de regeneración de clave con confirmación
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
      setApiKey(newApiKey);
      setIsVisible(true);
      
      // Ocultar automáticamente después de 30 segundos
      setTimeout(() => {
        setIsVisible(false);
        // No eliminamos la clave del estado, solo la ocultamos
        fetchApiKeyExistence(); // Actualiza el estado a 'exists' después de ocultar
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integración de Pedidos Externos (n8n)</CardTitle>
        <CardDescription>
          Configure la integración para recibir pedidos desde sistemas externos como n8n
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              onClick={() => {
                navigator.clipboard.writeText(apiUrl);
                toast({
                  title: "URL copiada",
                  description: "URL de API copiada al portapapeles"
                });
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Utilice esta URL como destino para enviar pedidos desde sistemas externos
          </p>
        </div>

        <div className="space-y-2 pt-4">
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
        </div>

        {apiKey && isVisible && (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-600">
              <strong>¡Importante!</strong> Copia y guarda esta clave ahora. Por seguridad, no se mostrará de nuevo automáticamente.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Formato de pedidos</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Los pedidos enviados a la API deben tener el siguiente formato JSON:
          </p>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
{`{
  "nombre_cliente": "Nombre del Cliente", 
  "numero_mesa": "4",                    // O "is_delivery": true para delivery
  "items_pedido": [
    {
      "sku_producto": "PIZZA-MARG-M",   // SKU del producto en el menú
      "cantidad": 2,
      "precio_unitario": 12.50,
      "notas_item": "Sin cebolla"       // Opcional
    }
  ],
  "total_pedido": 25.00,
  "estado_pedido_inicial": "pending"
}`}
          </pre>
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://supabase.com/dashboard/project/imcxvnivqrckgjrimzck/functions/ingresar-pedido/logs" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Ver logs de la función
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>

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
    </Card>
  );
};

export default ApiIntegrationConfig;
