
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ApiKeyTabProps {
  apiKey: string;
  loading: boolean;
  refreshing: boolean;
  generateNewApiKey: () => Promise<void>;
}

const ApiKeyTab: React.FC<ApiKeyTabProps> = ({ 
  apiKey, 
  loading, 
  refreshing, 
  generateNewApiKey 
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const { toast } = useToast();
  
  const projectUrl = window.location.origin;
  const apiEndpoint = `${projectUrl}/api/v1/ingresar-pedido`;
  
  const copyToClipboard = (text: string, message: string = "Copiado al portapapeles") => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        toast({ title: "Éxito", description: message });
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive",
        });
      }
    );
  };
  
  const handleGenerateNewKey = async () => {
    setShowConfirmDialog(false);
    await generateNewApiKey();
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Clave API</CardTitle>
          <CardDescription>
            Esta clave se utiliza para autenticar las solicitudes a la API desde sistemas externos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clave API para integraciones externas</Label>
            <div className="flex space-x-2">
              <Input 
                type="text" 
                value={apiKey} 
                readOnly 
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKey)}
                disabled={!apiKey || loading}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Nombre del encabezado HTTP</Label>
            <div className="flex space-x-2">
              <Input 
                type="text" 
                value="x-api-key" 
                readOnly 
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard("x-api-key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Este es el nombre del encabezado HTTP donde debe enviarse la clave API
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>URL del Endpoint</Label>
            <div className="flex space-x-2">
              <Input 
                type="text" 
                value={apiEndpoint} 
                readOnly 
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiEndpoint)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmDialog(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Regenerar Clave API
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Regenerar la clave API invalidará la conexión existente y deberás actualizarla en sistemas externos como n8n.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateNewKey}>
              Sí, Generar Nueva Clave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApiKeyTab;
