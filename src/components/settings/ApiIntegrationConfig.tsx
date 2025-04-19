
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ApiEndpointDisplay } from './api/ApiEndpointDisplay';
import { ApiKeySection } from './api/ApiKeySection';
import { ApiFormatExample } from './api/ApiFormatExample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestingTab } from '@/components/integration/testing';

export const ApiIntegrationConfig = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('');
  const [examplePayload, setExamplePayload] = useState('');

  useEffect(() => {
    const projectId = 'imcxvnivqrckgjrimzck';
    setApiUrl(`https://${projectId}.supabase.co/functions/v1/ingresar-pedido`);
    
    const payload = {
      "id_externo": "order-123",
      "nombre_cliente": "Juan Pérez",
      "numero_mesa": "5",
      "items_pedido": [
        {
          "sku_producto": "HAM001",
          "cantidad": 2,
          "precio_unitario": 8.50,
          "notas_item": "Sin cebolla"
        },
        {
          "sku_producto": "BEBCOC001",
          "cantidad": 1,
          "precio_unitario": 5.00
        }
      ],
      "total_pedido": 22.00,
      "notas_generales_pedido": "Cliente frecuente",
      "estado_pedido_inicial": "pendiente"
    };
    
    setExamplePayload(JSON.stringify(payload, null, 2));
  }, []);

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

      if (data?.value) {
        setApiKey('exists');
      } else {
        setApiKey(null);
      }
    } catch (error) {
      console.error('Error inesperado al verificar la clave API:', error);
    }
  };

  useEffect(() => {
    fetchApiKeyExistence();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integración de Pedidos Externos (n8n)</CardTitle>
        <CardDescription>
          Configure la integración para recibir pedidos desde sistemas externos como n8n con una clave API permanente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="endpoint">
          <TabsList className="mb-4">
            <TabsTrigger value="endpoint">Punto de Acceso</TabsTrigger>
            <TabsTrigger value="testing">Pruebas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="endpoint" className="space-y-4">
            <ApiEndpointDisplay apiUrl={apiUrl} />

            <div className="space-y-2 pt-4">
              <ApiKeySection />
            </div>

            <ApiFormatExample />
          </TabsContent>
          
          <TabsContent value="testing">
            <TestingTab 
              apiKey={apiKey === 'exists' ? '' : apiKey || ''} 
              examplePayload={examplePayload} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiIntegrationConfig;
