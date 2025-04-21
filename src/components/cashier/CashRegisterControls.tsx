
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Clock, LayoutGrid, Lock } from 'lucide-react';
import { useCashRegister } from '@/hooks/use-cash-register';
import { CashRegisterShift } from '@/services/cashierService';
import { MovementForm } from './components/MovementForm';
import { ReportsTab } from './components/ReportsTab';
import { CloseShiftDialog } from './components/CloseShiftDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CashRegisterControlsProps {
  shift: CashRegisterShift | null;
}

const CashRegisterControls: React.FC<CashRegisterControlsProps> = ({ shift }) => {
  const [registerTab, setRegisterTab] = useState('cashbox');
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState('');
  const { closeCurrentShift, isEndingShift } = useCashRegister();
  const { toast } = useToast();

  const handleCloseCashRegister = async () => {
    if (!finalAmount) {
      toast({
        title: "Error",
        description: "Por favor ingresa el monto final en caja",
        variant: "destructive"
      });
      return;
    }

    const success = await closeCurrentShift(parseFloat(finalAmount));
    if (success) {
      setIsCloseDialogOpen(false);
    }
  };

  const handleCashMovement = (type: 'in' | 'out', amount: number, reason: string) => {
    toast({
      title: type === 'in' ? "Entrada registrada" : "Salida registrada",
      description: "El movimiento de efectivo ha sido registrado"
    });
  };

  const handlePrintReport = (reportType: string) => {
    toast({
      title: "Reporte generado",
      description: `El reporte "${reportType}" ha sido enviado a la impresora`
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'HH:mm:ss', { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  if (!shift) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium flex items-center">
            <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
            Control de Caja
          </h2>
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="mr-1 h-3 w-3" />
            Sin Turno Activo
          </Badge>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin turno activo</AlertTitle>
          <AlertDescription>
            No hay un turno de caja activo. Por favor inicia un turno para acceder a estas funciones.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
          Control de Caja
        </h2>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Clock className="mr-1 h-3 w-3" />
          Caja Abierta
        </Badge>
      </div>
      
      <Tabs value={registerTab} onValueChange={setRegisterTab} className="flex-grow flex flex-col">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="cashbox">Caja</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cashbox" className="flex-grow">
          <div className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Monto Inicial:</span>
                <span className="text-sm">${shift.initial_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Ventas del Turno:</span>
                <span className="text-sm">${shift.total_sales?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Hora de Apertura:</span>
                <span className="text-sm">{formatDate(shift.started_at)}</span>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setIsCloseDialogOpen(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Cerrar Turno
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="movements" className="flex-grow">
          <div className="space-y-4">
            <MovementForm onMovement={handleCashMovement} />
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="flex-grow">
          <ReportsTab shift={shift} onPrintReport={handlePrintReport} />
        </TabsContent>
      </Tabs>

      <CloseShiftDialog 
        isOpen={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        onClose={handleCloseCashRegister}
        isClosing={isEndingShift}
        shift={shift}
        finalAmount={finalAmount}
        onFinalAmountChange={setFinalAmount}
      />
    </div>
  );
};

export default CashRegisterControls;
