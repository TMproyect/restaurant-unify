
import React from 'react';
import { CashRegisterShift } from '@/services/cashierService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

interface CashRegisterOverviewProps {
  shift: CashRegisterShift;
}

export const CashRegisterOverview: React.FC<CashRegisterOverviewProps> = ({ shift }) => {
  return (
    <div className="bg-muted/30 p-3 rounded-md">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Monto Inicial:</span>
        <span className="text-sm">{formatCurrency(shift.initial_amount || 0)}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Ventas del Turno:</span>
        <span className="text-sm">{formatCurrency(shift.total_sales || 0)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm font-medium">Hora de Apertura:</span>
        <span className="text-sm">{formatDateTime(shift.started_at)}</span>
      </div>
    </div>
  );
};
