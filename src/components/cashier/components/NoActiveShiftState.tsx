
import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import OpenShiftForm from '../OpenShiftForm';

export const NoActiveShiftState = () => {
  // Simplify this component to render faster
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <CircleDollarSign size={24} className="text-primary" />
        <h1 className="text-2xl font-bold">Punto de Venta / Caja</h1>
      </div>
      <OpenShiftForm />
    </div>
  );
};
