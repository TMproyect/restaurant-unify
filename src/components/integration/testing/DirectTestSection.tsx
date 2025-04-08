
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Terminal, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DirectTestSectionProps {
  testPayload: string;
  setTestPayload: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  useStoredKey: boolean;
  manualApiKey: string;
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
  setTestResult,
  setTestStatus,
  toast
}) => {
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

      const projectId = 'imcxvnivqrckgjrimzck';
      const apiEndpoint = `https://${projectId}.supabase.co/functions/v1/ingresar-pedido`;
      
      console.log("Ejecutando prueba con endpoint:", apiEndpoint);
      console.log("API Key:", keyToUse.substring(0, 4) + "****" + keyToUse.substring(keyToUse.length - 4));
      
      // Actualización: Usar Authorization Bearer en lugar de x-api-key
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyToUse}`
      };
      
      console.log("Headers enviados:", JSON.stringify(headers));
      console.log("Payload enviado:", JSON.stringify(payload));
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      console.log("Código de estado HTTP recibido:", response.status);
      
      let data;
      const responseText = await response.text();
      console.log("Texto de respuesta completo:", responseText);
      
      try {
        data = JSON.parse(responseText);
        console.log("Respuesta parseada:", data);
      } catch (error) {
        console.error("Error al parsear la respuesta como JSON:", error);
        setTestStatus('error');
        setTestResult(`Error: No se pudo parsear la respuesta como JSON. Respuesta recibida: ${responseText}`);
        toast({
          title: "Error",
          description: "Formato de respuesta inválido",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
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

  return (
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
  );
};
