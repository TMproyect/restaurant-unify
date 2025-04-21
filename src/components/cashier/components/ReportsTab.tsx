
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, Printer } from 'lucide-react';
import { CashRegisterShift } from '@/services/cashierService';

interface ReportsTabProps {
  shift: CashRegisterShift;
  onPrintReport: (reportType: string) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ shift, onPrintReport }) => {
  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-start"
        onClick={() => onPrintReport('Ventas del Turno')}
      >
        <FileText className="mr-2 h-4 w-4" />
        Reporte de Ventas del Turno
      </Button>
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-start"
        onClick={() => onPrintReport('Ventas Diario')}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Reporte de Ventas Diario
      </Button>
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-start"
        onClick={() => onPrintReport('Corte de Caja')}
      >
        <Printer className="mr-2 h-4 w-4" />
        Imprimir Corte de Caja
      </Button>
      
      <Separator className="my-4" />
      
      <div className="bg-muted/30 p-3 rounded-md">
        <h3 className="text-sm font-medium mb-2">Resumen del Turno</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Efectivo Inicial:</span>
            <span>${shift.initial_amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ventas en Efectivo:</span>
            <span>${shift.total_cash_sales?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ventas con Tarjeta:</span>
            <span>${shift.total_card_sales?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Ventas:</span>
            <span>${shift.total_sales?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Efectivo en Caja:</span>
            <span>${(shift.initial_amount + (shift.total_cash_sales || 0)).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
