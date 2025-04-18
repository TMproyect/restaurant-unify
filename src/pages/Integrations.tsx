
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApiKeyTab from '@/components/integration/ApiKeyTab';
import DocumentationTab from '@/components/integration/DocumentationTab';
import { TestingTab } from '@/components/integration/testing';

const Integrations = () => {
  // State for API key management
  const [apiKey, setApiKey] = useState<string>(() => {
    // Generate a secure API key on initial load if not existing
    const generateSecureApiKey = () => {
      const prefix = "pos_api_";
      const randomPart = Array.from(crypto.getRandomValues(new Uint32Array(4)))
        .map(x => x.toString(36))
        .join('');
      const timestampPart = Date.now().toString(36);
      const specialChars = "!@#$%^&*()_+";
      const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
      
      return `${prefix}${timestampPart}_${randomPart}${specialChar}`.slice(0, 48);
    };

    // Check if there's an existing API key in localStorage
    const storedApiKey = localStorage.getItem('pos_api_key');
    if (storedApiKey) return storedApiKey;

    const newApiKey = generateSecureApiKey();
    localStorage.setItem('pos_api_key', newApiKey);
    return newApiKey;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Example payload for testing - as a JSON string
  const examplePayload = JSON.stringify({
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
  }, null, 2);

  // Function to generate new API key
  const generateNewApiKey = async () => {
    const prefix = "pos_api_";
    const randomPart = Array.from(crypto.getRandomValues(new Uint32Array(4)))
      .map(x => x.toString(36))
      .join('');
    const timestampPart = Date.now().toString(36);
    const specialChars = "!@#$%^&*()_+";
    const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    
    const newKey = `${prefix}${timestampPart}_${randomPart}${specialChar}`.slice(0, 48);
    
    setApiKey(newKey);
    localStorage.setItem('pos_api_key', newKey);
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
                  Genera y administra tu clave API permanente para integraciones externas
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
