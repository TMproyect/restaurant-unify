
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RolesAndPermissions from '@/components/settings/RolesAndPermissions';
import usePrintService from '@/hooks/use-print-service';
import OrderPrintController from '@/components/OrderPrintController';
import ApiIntegrationConfig from '@/components/settings/ApiIntegrationConfig';
import PaymentConfiguration from '@/components/settings/PaymentConfiguration';
import ArchiveSettings from '@/components/settings/ArchiveSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';
import PrinterSettingsCard from '@/components/settings/printers/PrinterSettingsCard';
import TemporaryRoleManager from '@/components/settings/TemporaryRoleManager';
import { handleError } from '@/utils/errorHandling';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showQzDiagnostics, setShowQzDiagnostics] = useState(false);
  const [showPrinterDiagnostics, setShowPrinterDiagnostics] = useState(false);
  
  const { 
    availablePrinters, 
    isConnected, 
    connect,
    scanForPrinters,
    status
  } = usePrintService();

  useEffect(() => {
    if (status === 'connected') {
      setIsConnecting(false);
    } else if (status === 'error' && isConnecting) {
      setIsConnecting(false);
    }
  }, [status, isConnecting]);

  useEffect(() => {
    if (status === 'connected' && availablePrinters.length === 0 && activeTab === 'printers') {
      const timer = setTimeout(() => {
        setShowPrinterDiagnostics(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [status, availablePrinters.length, activeTab]);

  const handleRefreshPrinters = async () => {
    console.log("Settings: Iniciando escaneo de impresoras desde settings");
    setIsScanning(true);
    try {
      await scanForPrinters();
      console.log("Settings: Escaneo de impresoras completado");
      
      if (availablePrinters.length === 0) {
        setShowPrinterDiagnostics(true);
      }
    } catch (error) {
      console.error("Settings: Error al escanear impresoras", error);
      handleError(error, 'Settings - Refresh Printers');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async () => {
    console.log("Settings: Iniciando conexión desde settings");
    setIsConnecting(true);
    try {
      const result = await connect();
      console.log("Settings: Resultado de conexión:", result ? "Exitoso" : "Fallido");
      
      if (result) {
        if (availablePrinters.length === 0) {
          setTimeout(() => {
            setShowPrinterDiagnostics(true);
          }, 1000);
        }
      } else {
        setShowQzDiagnostics(true);
      }
    } catch (error) {
      console.error("Settings: Error al conectar", error);
      handleError(error, 'Settings - Connect');
      setIsConnecting(false);
      setShowQzDiagnostics(true);
    }
  };

  return (
    <Layout>
      <OrderPrintController showAlert={false}>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Configuración</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="archives">Archivado</TabsTrigger>
              <TabsTrigger value="printers">Impresión</TabsTrigger>
              <TabsTrigger value="payments">Pagos</TabsTrigger>
              <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
              <TabsTrigger value="integration">Integraciones</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="archives" className="space-y-4">
              <ArchiveSettings />
            </TabsContent>

            <TabsContent value="printers" className="space-y-4">
              <PrinterSettingsCard 
                status={status}
                isConnected={isConnected}
                isConnecting={isConnecting}
                isScanning={isScanning}
                availablePrinters={availablePrinters}
                showQzDiagnostics={showQzDiagnostics}
                showPrinterDiagnostics={showPrinterDiagnostics}
                setShowQzDiagnostics={setShowQzDiagnostics}
                setShowPrinterDiagnostics={setShowPrinterDiagnostics}
                handleConnect={handleConnect}
                handleRefreshPrinters={handleRefreshPrinters}
              />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <PaymentConfiguration />
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <RolesAndPermissions />
              <TemporaryRoleManager />
            </TabsContent>
            
            <TabsContent value="integration" className="space-y-4">
              <ApiIntegrationConfig />
            </TabsContent>
          </Tabs>
        </div>
      </OrderPrintController>
    </Layout>
  );
};

export default Settings;
