
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { CashRegisterShift } from '@/services/cashierService';
import { formatDateTime } from '@/utils/formatters';

interface CashRegisterStatusProps {
  shift: CashRegisterShift;
}

export const CashRegisterStatus: React.FC<CashRegisterStatusProps> = ({ shift }) => {
  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
      <Clock className="mr-1 h-3 w-3" />
      Caja Abierta desde {formatDateTime(shift.started_at)}
    </Badge>
  );
};
