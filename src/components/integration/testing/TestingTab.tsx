
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ApiKeySelector } from './ApiKeySelector';
import { DirectTestSection } from './DirectTestSection';
import { TestResultDisplay } from './TestResultDisplay';
import { CurlCommandDisplay } from './CurlCommandDisplay';
import { N8nImportDisplay } from './N8nImportDisplay';
import { N8nManualConfig } from './N8nManualConfig';

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
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800">
            <span className="font-bold">Importante:</span> Para autenticar las solicitudes, 
            debe incluir la cabecera <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-800 font-mono">x-api-key</code> con 
            el valor de su clave API.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atención</AlertTitle>
            <AlertDescription>
              Debe generar una API key en la sección "Configuración &gt; Integraciones" antes de poder realizar pruebas.
              Las claves API se regeneran completamente, no se modifican.
            </AlertDescription>
          </Alert>
          
          <ApiKeySelector 
            useStoredKey={useStoredKey}
            setUseStoredKey={setUseStoredKey}
            manualApiKey={manualApiKey}
            setManualApiKey={setManualApiKey}
          />
          
          <DirectTestSection 
            testPayload={testPayload}
            setTestPayload={setTestPayload}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            useStoredKey={useStoredKey}
            manualApiKey={manualApiKey}
            setTestResult={setTestResult}
            setTestStatus={setTestStatus}
            toast={toast}
          />
        </div>
        
        {testResult && (
          <TestResultDisplay 
            testResult={testResult} 
            testStatus={testStatus} 
          />
        )}
        
        <CurlCommandDisplay 
          curlCommand={curlCommand} 
          copyToClipboard={copyToClipboard} 
        />
        
        <N8nImportDisplay 
          n8nImportCommand={n8nImportCommand} 
          copyToClipboard={copyToClipboard} 
        />
        
        <N8nManualConfig apiEndpoint={apiEndpoint} />
      </CardContent>
    </Card>
  );
};

export default TestingTab;
