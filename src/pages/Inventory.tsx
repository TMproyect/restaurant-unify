
import React from 'react';
import Layout from '@/components/layout/Layout';

const Inventory = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona el inventario de tu restaurante
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p>Módulo de inventario en desarrollo.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
