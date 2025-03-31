
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
} from 'lucide-react';

const CashRegisterControls = () => {
  const [registerTab, setRegisterTab] = useState('cashbox');
  const [isRegisterOpen, setIsRegisterOpen] = useState(true);
  const [initialCashAmount, setInitialCashAmount] = useState('');
  const { toast } = useToast();

  const handleOpenRegister = () => {
    if (!initialCashAmount || parseFloat(initialCashAmount) < 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto inicial válido",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Caja abierta",
      description: `Turno iniciado con $${initialCashAmount} en caja`
    });
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
    toast({
      title: "Caja cerrada",
      description: "El turno ha sido cerrado exitosamente"
    });
  };

  const handleCashMovement = (type: 'in' | 'out') => {
    toast({
      title: type === 'in' ? "Entrada registrada" : "Salida registrada",
      description: "El movimiento de efectivo ha sido registrado"
    });
  };

  const handlePrintReport = () => {
    toast({
      title: "Reporte generado",
      description: "El reporte ha sido enviado a la impresora"
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
          Control de Caja
        </h2>
        <Badge variant={isRegisterOpen ? "outline" : "secondary"} className={
          isRegisterOpen 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-gray-100 text-gray-800 border-gray-200"
        }>
          <Clock className="mr-1 h-3 w-3" />
          {isRegisterOpen ? "Caja Abierta" : "Caja Cerrada"}
        </Badge>
      </div>
      
      <Tabs value={registerTab} onValueChange={setRegisterTab} className="flex-grow flex flex-col">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="cashbox">Caja</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cashbox" className="flex-grow">
          {!isRegisterOpen ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Apertura de Caja</CardTitle>
                <CardDescription>
                  Ingresa el monto inicial para iniciar el turno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialCash">Monto Inicial</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="initialCash"
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00" 
                        className="pl-8"
                        value={initialCashAmount}
                        onChange={(e) => setInitialCashAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cashier">Cajero</Label>
                    <Select defaultValue="current">
                      <SelectTrigger id="cashier">
                        <SelectValue placeholder="Seleccionar cajero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Usuario Actual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={handleOpenRegister}
                >
                  Iniciar Turno
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Monto Inicial:</span>
                  <span className="text-sm">${initialCashAmount}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Ventas del Turno:</span>
                  <span className="text-sm">$1,250.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Hora de Apertura:</span>
                  <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCloseRegister}
              >
                <Lock className="mr-2 h-4 w-4" />
                Cerrar Turno
              </Button>
            </div>
          )}
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
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo</Label>
                    <Input 
                      id="reason"
                      placeholder="Proporciona un motivo para el movimiento" 
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
              onClick={handlePrintReport}
            >
              <FileText className="mr-2 h-4 w-4" />
              Reporte de Ventas del Turno
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-start"
              onClick={handlePrintReport}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Reporte de Ventas Diario
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-start"
              onClick={handlePrintReport}
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
                <span>${initialCashAmount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ventas en Efectivo:</span>
                <span>$750.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ventas con Tarjeta:</span>
                <span>$500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Ventas:</span>
                <span>$1,250.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efectivo en Caja:</span>
                <span>${initialCashAmount ? (parseFloat(initialCashAmount) + 750).toFixed(2) : '750.00'}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashRegisterControls;
