
import React from 'react';
import DashboardCard from './DashboardCard';

const DefaultCards: React.FC = () => {
  return (
    <>
      {[
        { title: 'Ventas del Día', value: '$0.00', icon: 'dollar-sign' },
        { title: 'Pedidos Activos', value: '0', icon: 'clipboard-list' },
        { title: 'Inventario Bajo', value: '0', icon: 'package' },
        { title: 'Clientes Hoy', value: '0', icon: 'users' }
      ].map((card, i) => (
        <DashboardCard key={i} {...card} />
      ))}
    </>
  );
};

export default DefaultCards;
