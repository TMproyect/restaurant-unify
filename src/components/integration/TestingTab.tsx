
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TestingTabProps {
  apiKey: string;
  examplePayload: string;
}

const TestingTab: React.FC<TestingTabProps> = ({ apiKey, examplePayload }) => {
  const { toast } = useToast();
  const projectId = 'imcxvnivqrckgjrimzck';
  const apiEndpoint = `https://${projectId}.supabase.co/functions/v1/ingresar-pedido`;
  
  const copyToClipboard = (text: string, message: string = "Copiado al portapapeles") => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({ title: "Éxito", description: message });
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
  
  // Genera un comando cURL completo para n8n
  const curlCommand = `curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY_HERE'}" \\
  -d '${examplePayload.replace(/\n/g, ' ')}'`;
  
  // Genera una versión del comando para importar directamente en n8n
  const n8nImportCommand = `${apiEndpoint}
Content-Type: application/json
x-api-key: ${apiKey || 'YOUR_API_KEY_HERE'}

${examplePayload}`;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Probar la API</CardTitle>
        <CardDescription>
          Utilice esta sección para probar la integración externa con herramientas como n8n, Postman o cURL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800">
            <span className="font-bold">Importante:</span> Para autenticar las solicitudes, 
            debe incluir la cabecera <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-800 font-mono">x-api-key</code> con 
            el valor de su clave API.
          </AlertDescription>
        </Alert>
        
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
        
        <div>
          <h3 className="text-lg font-medium">n8n</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Configuración manual para n8n:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Utilice el nodo "HTTP Request"</li>
            <li>Establezca el método a POST</li>
            <li>URL: {apiEndpoint}</li>
            <li>Añada el encabezado <code className="px-1 py-0.5 bg-muted rounded font-mono">x-api-key</code> con el valor de su clave API</li>
            <li>Añada el encabezado <code className="px-1 py-0.5 bg-muted rounded font-mono">Content-Type</code> con el valor <code className="px-1 py-0.5 bg-muted rounded font-mono">application/json</code></li>
            <li>En el cuerpo, proporcione un JSON con la estructura mostrada anteriormente</li>
          </ol>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-4"
            asChild
          >
            <a href="https://n8n.io/integrations/http-request/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Documentación de n8n para HTTP Request
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingTab;
