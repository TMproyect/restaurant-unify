
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApiKeyTab from '@/components/integration/ApiKeyTab';
import DocumentationTab from '@/components/integration/DocumentationTab';
import TestingTab from '@/components/integration/TestingTab';

const Integrations = () => {
  // State for API key management
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Example payload for testing
  const examplePayload = {
    external_id: "ORD-123456",
    items: [
      { name: "Hamburguesa", price: 8.99, quantity: 2 },
      { name: "Refresco", price: 2.50, quantity: 2 }
    ],
    total: 22.98,
    customer: {
      name: "Juan Pérez",
      phone: "555-123-4567"
    }
  };

  // Function to generate new API key
  const generateNewApiKey = async () => {
    setRefreshing(true);
    try {
      // Simulated API key generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApiKey(`pk_${Math.random().toString(36).substring(2, 15)}`);
      setRefreshing(false);
    } catch (error) {
      console.error('Error generating API key:', error);
      setRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Integración de APIs</h1>
          <p className="text-muted-foreground">
            Configura integraciones con servicios externos
          </p>
        </div>

        <Tabs defaultValue="docs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="docs">Documentación</TabsTrigger>
            <TabsTrigger value="apikey">Clave API</TabsTrigger>
            <TabsTrigger value="testing">Pruebas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="docs" className="space-y-4">
            <DocumentationTab apiKey={apiKey} />
          </TabsContent>
          
          <TabsContent value="apikey" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Clave API</CardTitle>
                <CardDescription>
                  Genera y administra tu clave API para integraciones externas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeyTab 
                  apiKey={apiKey} 
                  loading={loading} 
                  refreshing={refreshing} 
                  generateNewApiKey={generateNewApiKey} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="testing" className="space-y-4">
            <TestingTab apiKey={apiKey} examplePayload={examplePayload} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Integrations;
