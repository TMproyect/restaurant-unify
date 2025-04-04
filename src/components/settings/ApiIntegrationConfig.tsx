
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ApiEndpointDisplay } from './api/ApiEndpointDisplay';
import { ApiKeySection } from './api/ApiKeySection';
import { ApiFormatExample } from './api/ApiFormatExample';

export const ApiIntegrationConfig = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('');

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integración de Pedidos Externos (n8n)</CardTitle>
        <CardDescription>
          Configure la integración para recibir pedidos desde sistemas externos como n8n
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ApiEndpointDisplay apiUrl={apiUrl} />

        <div className="space-y-2 pt-4">
          <ApiKeySection apiKey={apiKey} onApiKeyChange={setApiKey} />
        </div>

        <ApiFormatExample />
      </CardContent>
    </Card>
  );
};

export default ApiIntegrationConfig;
