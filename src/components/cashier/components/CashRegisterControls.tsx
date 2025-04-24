import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, LayoutGrid, AlertCircle } from 'lucide-react';
import { CashRegisterShift } from '@/services/cashier';
import { MovementForm } from './MovementForm';
import { ReportsTab } from './ReportsTab';
import { CloseShiftDialog } from './CloseShiftDialog';
import { CashRegisterStatus } from './CashRegisterStatus';
import { CashRegisterOverview } from './CashRegisterOverview';
import { useToast } from '@/hooks/use-toast';
import { useCashRegister } from '@/hooks/use-cash-register';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CashRegisterControlsProps {
  shift: CashRegisterShift | null;
}

const CashRegisterControls: React.FC<CashRegisterControlsProps> = ({ shift }) => {
  const [registerTab, setRegisterTab] = useState('cashbox');
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState('');
  const { closeCurrentShift, isEndingShift } = useCashRegister();
  const { toast } = useToast();

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

  if (!shift) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium flex items-center">
            <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
            Control de Caja
          </h2>
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
        <CashRegisterStatus shift={shift} />
      </div>

      <Tabs value={registerTab} onValueChange={setRegisterTab} className="flex-grow flex flex-col">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="cashbox">Caja</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="cashbox" className="flex-grow">
          <div className="space-y-4">
            <CashRegisterOverview shift={shift} />
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
          <MovementForm onMovement={handleCashMovement} />
        </TabsContent>

        <TabsContent value="reports" className="flex-grow">
          <ReportsTab shift={shift} onPrintReport={handlePrintReport} />
        </TabsContent>
      </Tabs>

      <CloseShiftDialog 
        isOpen={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        onClose={async (finalAmountValue: string) => {
          if (!finalAmountValue) {
            toast({
              title: "Error",
              description: "Por favor ingresa el monto final en caja",
              variant: "destructive"
            });
            return;
          }
      
          const success = await closeCurrentShift(parseFloat(finalAmountValue));
          if (success) {
            setIsCloseDialogOpen(false);
          }
        }}
        isClosing={isEndingShift}
        shift={shift}
        finalAmount={finalAmount}
        onFinalAmountChange={setFinalAmount}
      />
    </div>
  );
};

export default CashRegisterControls;
