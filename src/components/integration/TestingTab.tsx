
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink, Info, Send, Terminal, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface TestingTabProps {
  apiKey: string;
  examplePayload: string;
}

const TestingTab: React.FC<TestingTabProps> = ({ apiKey, examplePayload }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testPayload, setTestPayload] = useState(examplePayload);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null);
  const [manualApiKey, setManualApiKey] = useState('');
  const [useStoredKey, setUseStoredKey] = useState(true);
  
  const projectId = 'imcxvnivqrckgjrimzck';
  const apiEndpoint = `https://${projectId}.supabase.co/functions/v1/ingresar-pedido`;
  
  // Función para obtener la API key almacenada en la base de datos
  const fetchStoredApiKey = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'external_api_key')
        .single();
        
      if (error) {
        console.error('Error al obtener la API key almacenada:', error);
        toast({
          title: "Error",
          description: "No se pudo obtener la API key almacenada",
          variant: "destructive",
        });
        return null;
      }
      
      return data?.value || null;
    } catch (error) {
      console.error('Error inesperado al obtener la API key:', error);
      return null;
    }
  };
  
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

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    setTestStatus(null);

    let keyToUse = useStoredKey ? await fetchStoredApiKey() : manualApiKey;
    
    if (!keyToUse) {
      toast({
        title: "Error",
        description: useStoredKey ? 
          "No se pudo obtener la API key almacenada" : 
          "Por favor ingrese una API key manual",
        variant: "destructive",
      });
      setTestStatus('error');
      setTestResult("Error: No hay una API key válida para usar");
      setIsLoading(false);
      return;
    }

    try {
      let payload;
      try {
        payload = JSON.parse(testPayload);
      } catch (e) {
        toast({
          title: "Error",
          description: "El payload JSON no es válido",
          variant: "destructive",
        });
        setTestStatus('error');
        setTestResult("Error de formato: El payload JSON no es válido");
        setIsLoading(false);
        return;
      }

      console.log("Ejecutando prueba con endpoint:", apiEndpoint);
      console.log("API Key:", keyToUse.substring(0, 4) + "****" + keyToUse.substring(keyToUse.length - 4));
      console.log("Headers de la solicitud:", JSON.stringify({
        'Content-Type': 'application/json',
        'x-api-key': keyToUse.substring(0, 4) + "****" + keyToUse.substring(keyToUse.length - 4)
      }));
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Respuesta de la prueba:", data);
      
      setTestStatus(response.ok ? 'success' : 'error');
      setTestResult(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast({
          title: "Éxito",
          description: "La prueba se ejecutó correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "La prueba falló",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en la prueba:", error);
      setTestStatus('error');
      setTestResult(error instanceof Error ? error.message : "Error inesperado durante la prueba");
      
      toast({
        title: "Error",
        description: "Ocurrió un error al realizar la prueba",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Genera un comando cURL completo para n8n
  const curlCommand = `curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY_HERE'}" \\
  -d '${testPayload.replace(/\n/g, ' ')}'`;
  
  // Genera una versión del comando para importar directamente en n8n
  const n8nImportCommand = `${apiEndpoint}
Content-Type: application/json
x-api-key: ${apiKey || 'YOUR_API_KEY_HERE'}

${testPayload}`;
  
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
        
        <div className="space-y-4">
          <div>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription>
                Debe generar una API key en la sección "Configuración > Integraciones" antes de poder realizar pruebas.
                Las claves API se regeneran completamente, no se modifican.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="useStoredKey" 
                  checked={useStoredKey} 
                  onChange={() => setUseStoredKey(!useStoredKey)} 
                  className="h-4 w-4"
                />
                <Label htmlFor="useStoredKey">Usar API key almacenada en la base de datos</Label>
              </div>
              
              {!useStoredKey && (
                <div className="space-y-2">
                  <Label htmlFor="manualApiKey">API Key Manual:</Label>
                  <Input
                    id="manualApiKey"
                    value={manualApiKey}
                    onChange={(e) => setManualApiKey(e.target.value)}
                    placeholder="Ingrese la API key manualmente"
                    className="font-mono"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Prueba directa</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Modifique el payload según sus necesidades y ejecute la prueba:
            </p>
            <Textarea 
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={runTest}
                disabled={isLoading}
                className="ml-auto"
              >
                {isLoading ? (
                  <>
                    <Terminal className="mr-2 h-4 w-4 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Ejecutar prueba
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {testResult && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Resultado de la prueba</h3>
            <div className={`p-4 rounded font-mono text-sm overflow-auto ${
              testStatus === 'success' ? 'bg-green-50 border border-green-200' :
              testStatus === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border'
            }`}>
              <pre>{testResult}</pre>
            </div>
          </div>
        )}
        
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
