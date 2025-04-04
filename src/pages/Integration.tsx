
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ApiKeyTab from '@/components/integration/ApiKeyTab';
import DocumentationTab from '@/components/integration/DocumentationTab';
import TestingTab from '@/components/integration/TestingTab';

const Integration = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Ejemplo de payload para la documentación
  const examplePayload = `{
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
}`;
  
  useEffect(() => {
    fetchApiKey();
  }, []);
  
  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'external_api_key')
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setApiKey(data.value);
      }
    } catch (err) {
      console.error("Error al cargar la API key:", err);
      toast({
        title: "Error",
        description: "No se pudo cargar la clave de API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateNewApiKey = async () => {
    try {
      setRefreshing(true);
      
      // Generar un nuevo API key
      const newKey = `pos_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: newKey,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'external_api_key');
      
      if (error) {
        throw error;
      }
      
      setApiKey(newKey);
      toast({
        title: "Éxito",
        description: "Se ha generado una nueva clave de API",
      });
    } catch (err) {
      console.error("Error al regenerar la API key:", err);
      toast({
        title: "Error",
        description: "No se pudo generar una nueva clave de API",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Integración API Externa</h1>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Información importante</AlertTitle>
          <AlertDescription>
            Esta API permite la integración con sistemas externos como n8n para recibir pedidos automáticamente. 
            Proteja su clave API y asegúrese de utilizarla en entornos seguros.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="api-key">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="api-key">Clave API</TabsTrigger>
            <TabsTrigger value="documentation">Documentación</TabsTrigger>
            <TabsTrigger value="testing">Pruebas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-key">
            <ApiKeyTab 
              apiKey={apiKey} 
              loading={loading} 
              refreshing={refreshing} 
              generateNewApiKey={generateNewApiKey} 
            />
          </TabsContent>
          
          <TabsContent value="documentation">
            <DocumentationTab apiKey={apiKey} />
          </TabsContent>
          
          <TabsContent value="testing">
            <TestingTab apiKey={apiKey} examplePayload={examplePayload} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Integration;
