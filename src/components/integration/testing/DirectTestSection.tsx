
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

interface DirectTestSectionProps {
  testPayload: string;
  setTestPayload: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  useStoredKey: boolean;
  manualApiKey: string;
  fixedApiKey: string;
  setTestResult: (value: string | null) => void;
  setTestStatus: (value: 'success' | 'error' | null) => void;
  toast: any;
}

export const DirectTestSection: React.FC<DirectTestSectionProps> = ({
  testPayload,
  setTestPayload,
  isLoading,
  setIsLoading,
  useStoredKey,
  manualApiKey,
  fixedApiKey,
  setTestResult,
  setTestStatus,
  toast
}) => {
  const executeTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    setTestStatus(null);
    
    try {
      const apiKey = useStoredKey ? fixedApiKey : manualApiKey;
      if (!apiKey) {
        throw new Error("Se requiere una clave API válida para realizar la prueba");
      }
      
      let jsonPayload;
      try {
        jsonPayload = JSON.parse(testPayload);
      } catch (err) {
        throw new Error("El payload no es un JSON válido");
      }
      
      const projectId = 'imcxvnivqrckgjrimzck';
      const url = `https://${projectId}.supabase.co/functions/v1/ingresar-pedido`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(jsonPayload)
      });
      
      const resultText = await response.text();
      
      try {
        // Intentar formatear como JSON si es posible
        const resultJson = JSON.parse(resultText);
        setTestResult(JSON.stringify(resultJson, null, 2));
      } catch {
        // Si no es JSON, mostrar como texto plano
        setTestResult(resultText);
      }
      
      setTestStatus(response.ok ? 'success' : 'error');
      
      if (response.ok) {
        toast({
          title: "Prueba exitosa",
          description: `La solicitud se procesó correctamente con código ${response.status}`,
        });
      } else {
        toast({
          title: "Error en la prueba",
          description: `La solicitud falló con código ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al ejecutar la prueba:", error);
      setTestResult(error.message);
      setTestStatus('error');
      toast({
        title: "Error al ejecutar la prueba",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="test-payload">Payload JSON</Label>
        <Textarea
          id="test-payload"
          placeholder='{"nombre_cliente": "Juan Pérez", ...}'
          value={testPayload}
          onChange={(e) => setTestPayload(e.target.value)}
          className="font-mono h-64 whitespace-pre"
        />
      </div>
      
      <Button
        onClick={executeTest}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando solicitud...
          </>
        ) : (
          'Probar API'
        )}
      </Button>
    </div>
  );
};
