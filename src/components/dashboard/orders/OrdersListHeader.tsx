
import React from 'react';

const OrdersListHeader: React.FC = () => {
  console.log('🔄 [OrdersListHeader] Rendering headers');
  
  return (
    <thead>
      <tr>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
          Pedido
        </th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
          Cliente
        </th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
          Estado
        </th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
          Cocina
        </th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
          Total
        </th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
          Hora
        </th>
        <th className="px-3 py-3.5 text-center text-sm font-semibold text-foreground">
          Acciones
        </th>
      </tr>
    </thead>
  );
};

export default OrdersListHeader;
