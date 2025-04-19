
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  DollarSign,
  PlusCircle,
  MinusCircle,
  LayoutGrid,
  FileText,
  Printer,
  Lock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useCashRegister } from '@/hooks/use-cash-register';
import { CashRegisterShift } from '@/services/cashierService';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CashRegisterControlsProps {
  shift: CashRegisterShift | null;
}

const CashRegisterControls: React.FC<CashRegisterControlsProps> = ({ shift }) => {
  const [registerTab, setRegisterTab] = useState('cashbox');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
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

  const handleCashMovement = (type: 'in' | 'out') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido",
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un motivo para el movimiento",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: type === 'in' ? "Entrada registrada" : "Salida registrada",
      description: "El movimiento de efectivo ha sido registrado"
    });

    // Limpiar los campos después del registro
    setAmount('');
    setReason('');
  };

  const handlePrintReport = (reportType: string) => {
    toast({
      title: "Reporte generado",
      description: `El reporte "${reportType}" ha sido enviado a la impresora`
    });
  };

  // Formatear fecha de apertura si existe
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Movimientos de Efectivo</CardTitle>
                <CardDescription>
                  Registra entradas y salidas de efectivo de caja
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="amount"
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00" 
                        className="pl-8"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo</Label>
                    <Input 
                      id="reason"
                      placeholder="Proporciona un motivo para el movimiento"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleCashMovement('out')}
                >
                  <MinusCircle className="mr-2 h-4 w-4" />
                  Salida
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleCashMovement('in')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Entrada
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Movimientos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-4">
                  No hay movimientos registrados en este turno
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="flex-grow">
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-start"
              onClick={() => handlePrintReport('Ventas del Turno')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Reporte de Ventas del Turno
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-start"
              onClick={() => handlePrintReport('Ventas Diario')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Reporte de Ventas Diario
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-start"
              onClick={() => handlePrintReport('Corte de Caja')}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Corte de Caja
            </Button>
          </div>
          
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
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para cierre de caja */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Turno de Caja</DialogTitle>
            <DialogDescription>
              Para cerrar el turno, ingresa el monto final de efectivo en caja.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finalCashAmount">Monto Final en Efectivo</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="finalCashAmount"
                  type="number" 
                  min="0" 
                  step="0.01"
                  placeholder={(shift.initial_amount + (shift.total_cash_sales || 0)).toFixed(2)} 
                  className="pl-8"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monto esperado en caja: ${(shift.initial_amount + (shift.total_cash_sales || 0)).toFixed(2)}
              </p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Al cerrar el turno se generará un reporte final y no podrás procesar más ventas hasta iniciar un nuevo turno.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCloseCashRegister}
              disabled={isEndingShift}
            >
              {isEndingShift ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Cerrar Turno
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashRegisterControls;
