
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RolesAndPermissions from '@/components/settings/RolesAndPermissions';
import { PrinterStatus } from '@/components/ui/printing/PrinterStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, RefreshCw, ExternalLink, Download, ArrowRight } from 'lucide-react';
import usePrintService from '@/hooks/use-print-service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import OrderPrintController from '@/components/OrderPrintController';

const QZ_DOWNLOAD_LINK = "https://qz.io/download/";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { 
    availablePrinters, 
    defaultPrinter, 
    isConnected, 
    connect,
    scanForPrinters,
    status,
    isScanning
  } = usePrintService();

  const handleRefreshPrinters = async () => {
    console.log("Settings: Iniciando escaneo de impresoras desde settings");
    await scanForPrinters();
  };

  const handleConnect = async () => {
    console.log("Settings: Iniciando conexión desde settings");
    await connect();
  };

  return (
    <Layout>
      <OrderPrintController showAlert={false}>
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
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle>Sistema de Impresión</CardTitle>
                    <CardDescription>
                      Configuración del sistema de impresión QZ Tray
                    </CardDescription>
                  </div>
                  <PrinterStatus showHelp={true} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {status === 'error' && (
                      <Card className="border-amber-200 bg-amber-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">¿Cómo conectar QZ Tray?</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>
                              <strong>Descargue e instale QZ Tray</strong> en su computadora 
                              <div className="mt-1">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={QZ_DOWNLOAD_LINK} target="_blank" rel="noreferrer">
                                    <Download className="h-3 w-3 mr-1" />
                                    Descargar QZ Tray
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              </div>
                            </li>
                            <li className="pt-1">
                              <strong>Ejecute QZ Tray</strong> - busque la aplicación en su computadora y ábrala
                            </li>
                            <li className="pt-1">
                              <strong>Verifique que QZ Tray esté en ejecución</strong> - Busque el icono en la bandeja del sistema (junto al reloj)
                              <div className="mt-2 flex justify-center">
                                <img 
                                  src="/lovable-uploads/0dbccf9d-27fa-4c7d-a688-888de326ea75.png" 
                                  alt="QZ Tray en ejecución" 
                                  className="border rounded-md p-1 shadow-sm"
                                  style={{ maxWidth: '300px' }}
                                />
                              </div>
                            </li>
                            <li className="pt-2">
                              <strong>Intente conectar</strong> - Una vez que QZ Tray esté en ejecución, puede intentar conectarse
                              <div className="mt-1">
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={handleConnect}
                                  className="gap-1"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                  Conectar con QZ Tray
                                </Button>
                              </div>
                            </li>
                          </ol>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Estado del Sistema</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        El sistema de impresión QZ Tray permite imprimir directamente a impresoras locales desde el navegador. 
                        Debe estar instalado y ejecutándose en esta computadora.
                      </p>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRefreshPrinters}
                          disabled={!isConnected || isScanning}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                          {isScanning ? "Buscando..." : "Buscar Impresoras"}
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
                <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
                  <p>QZ Tray debe estar instalado en cada computadora que necesite imprimir tickets o comandas.</p>
                </CardFooter>
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
      </OrderPrintController>
    </Layout>
  );
};

export default Settings;
