
import React, { useEffect } from 'react';
import usePrintService from '@/hooks/use-print-service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    // Intenta conectar automáticamente si no está conectado
    if (!isConnected) {
      console.log("OrderPrintController: Intentando conexión automática");
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
    }
  }, [isConnected, connect]);

  const handleRetryConnection = async () => {
    console.log("OrderPrintController: Intentando reconexión manual");
    try {
      const success = await connect();
      console.log(`OrderPrintController: Resultado de reconexión: ${success ? 'Exitoso' : 'Fallido'}`);
    } catch (error) {
      console.error('OrderPrintController: Error en reconexión manual:', error);
    }
  };

  // Mostrar alerta solo si hay error y showAlert es true
  const showConnectionError = showAlert && status === 'error';

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
            >
              Reintentar Conexión
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
};

export default OrderPrintController;
