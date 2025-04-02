
import React, { useEffect } from 'react';
import usePrintService from '@/hooks/use-print-service';

interface OrderPrintControllerProps {
  children: React.ReactNode;
}

/**
 * Este componente es responsable de gestionar la conexión del 
 * servicio de impresión en las páginas relacionadas con órdenes.
 */
const OrderPrintController: React.FC<OrderPrintControllerProps> = ({ 
  children 
}) => {
  const { isConnected, connect } = usePrintService();

  useEffect(() => {
    // Intenta conectar automáticamente si no está conectado
    if (!isConnected) {
      connect()
        .then((success) => {
          if (success) {
            console.log('Sistema de impresión conectado automáticamente');
          } else {
            console.log('No se pudo conectar al sistema de impresión automáticamente');
          }
        })
        .catch((error) => {
          console.error('Error al conectar con el sistema de impresión:', error);
        });
    }
  }, [isConnected, connect]);

  return <>{children}</>;
};

export default OrderPrintController;
