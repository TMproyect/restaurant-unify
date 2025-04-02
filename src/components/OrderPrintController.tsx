
import React, { useEffect, useState } from 'react';
import usePrintService from '@/hooks/use-print-service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrinterConnectionStatus } from '@/services/printService';

interface OrderPrintControllerProps {
  children: React.ReactNode;
  showAlert?: boolean;
}

/**
 * Este componente es responsable de gestionar la conexión del 
 * servicio de impresión en las páginas relacionadas con órdenes.
 */
const OrderPrintController: React.FC<OrderPrintControllerProps> = ({ 
  children,
  showAlert = true
}) => {
  const { isConnected, connect, status } = usePrintService();
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  useEffect(() => {
    // Intenta conectar automáticamente si no está conectado
    if (!isConnected && !autoConnectAttempted) {
      console.log("OrderPrintController: Intentando conexión automática");
      setAutoConnectAttempted(true);
      
      // Pequeño retraso para asegurar que los scripts estén cargados
      const timer = setTimeout(() => {
        connect()
          .then((success) => {
            if (success) {
              console.log('OrderPrintController: Sistema de impresión conectado automáticamente');
            } else {
              console.log('OrderPrintController: No se pudo conectar al sistema de impresión automáticamente');
            }
          })
          .catch((error) => {
            console.error('OrderPrintController: Error al conectar con el sistema de impresión:', error);
          });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, connect, autoConnectAttempted]);

  // Resetear el estado de isRetrying cuando cambia el estado de conexión
  useEffect(() => {
    if (status !== 'connecting' && isRetrying) {
      setIsRetrying(false);
    }
  }, [status, isRetrying]);

  const handleRetryConnection = async () => {
    console.log("OrderPrintController: Intentando reconexión manual");
    setIsRetrying(true);
    try {
      const success = await connect();
      console.log(`OrderPrintController: Resultado de reconexión: ${success ? 'Exitoso' : 'Fallido'}`);
    } catch (error) {
      console.error('OrderPrintController: Error en reconexión manual:', error);
    }
    // No hacemos setIsRetrying(false) aquí porque lo manejamos en el useEffect
  };

  // Mostrar alerta solo si hay error y showAlert es true
  const showConnectionError = showAlert && (status === 'error' || status === 'disconnected');

  // Helper function to check if status is 'connecting'
  const isConnecting = status === 'connecting';

  return (
    <>
      {showConnectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <span className="font-medium">Problema con el sistema de impresión</span>
              <p className="text-sm mt-1">
                No se pudo conectar con QZ Tray. Verifique que esté instalado y en ejecución en su computadora.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleRetryConnection}
              disabled={isRetrying || isConnecting}
              className="min-w-[150px]"
            >
              {(isRetrying || isConnecting) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 
                  Conectando...
                </>
              ) : (
                'Reintentar Conexión'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
};

export default OrderPrintController;
