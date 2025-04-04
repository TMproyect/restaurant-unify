
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestingTabProps {
  apiKey: string;
  examplePayload: string;
}

const TestingTab: React.FC<TestingTabProps> = ({ apiKey, examplePayload }) => {
  const { toast } = useToast();
  const projectUrl = window.location.origin;
  const apiEndpoint = `${projectUrl}/api/v1/ingresar-pedido`;
  
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Probar la API</CardTitle>
        <CardDescription>
          Utilice esta sección para probar la integración externa con herramientas como n8n, Postman o cURL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">cURL</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Utilice el siguiente comando cURL para enviar un pedido de prueba:
          </p>
          <Textarea 
            value={`curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${examplePayload}'`}
            rows={8}
            readOnly 
            className="font-mono"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => copyToClipboard(`curl -X POST "${apiEndpoint}" -H "Content-Type: application/json" -H "x-api-key: ${apiKey}" -d '${examplePayload}'`, "Comando cURL copiado")}
          >
            <Copy className="mr-2 h-3 w-3" />
            Copiar comando
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">n8n</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Configuración para n8n:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Utilice el nodo "HTTP Request"</li>
            <li>Establezca el método a POST</li>
            <li>URL: {apiEndpoint}</li>
            <li>Añada el encabezado "x-api-key" con el valor de su clave API</li>
            <li>Establezca "Content-Type" a "application/json"</li>
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
