
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApiKeyTab from '@/components/integration/ApiKeyTab';
import DocumentationTab from '@/components/integration/DocumentationTab';
import TestingTab from '@/components/integration/TestingTab';

const Integrations = () => {
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
            <DocumentationTab />
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
                <ApiKeyTab />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="testing" className="space-y-4">
            <TestingTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Integrations;
