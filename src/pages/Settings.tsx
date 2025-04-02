
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RolesAndPermissions from '@/components/settings/RolesAndPermissions';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, RefreshCw } from 'lucide-react';
import usePrintService from '@/hooks/use-print-service';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { 
    availablePrinters, 
    defaultPrinter, 
    isConnected, 
    connect 
  } = usePrintService();

  const handleRefreshPrinters = async () => {
    if (!isConnected) {
      await connect();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configuración</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="printers">Impresión</TabsTrigger>
            <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
            <TabsTrigger value="integration">Integraciones</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>
                  Ajustes generales del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuraciones generales del sistema como idioma, moneda, etc.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Sistema de Impresión</CardTitle>
                  <CardDescription>
                    Configuración del sistema de impresión QZ Tray
                  </CardDescription>
                </div>
                <PrinterStatus />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Estado del Sistema</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      El sistema de impresión QZ Tray permite imprimir directamente a impresoras locales desde el navegador. 
                      Debe estar instalado y ejecutándose en esta computadora.
                    </p>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={handleRefreshPrinters}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar Impresoras
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Impresoras Disponibles</h3>
                    {isConnected && availablePrinters.length > 0 ? (
                      <div className="space-y-2">
                        {availablePrinters.map((printer, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center">
                              <Printer className="h-4 w-4 mr-2 text-primary" />
                              <span>{printer.name}</span>
                            </div>
                            {printer.isDefault && (
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                Predeterminada
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isConnected 
                          ? "No se encontraron impresoras. Verifique que estén conectadas y configuradas en su sistema." 
                          : "Conecte el sistema de impresión para ver las impresoras disponibles."}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <RolesAndPermissions />
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integraciones</CardTitle>
                <CardDescription>
                  Configure las integraciones con otros sistemas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuración de integraciones con otros sistemas como contabilidad, CRM, etc.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
