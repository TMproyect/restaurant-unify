
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Settings, CreditCard, BanknoteIcon, ArrowLeftRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { paymentConfig } from '@/components/cashier/payment/config/paymentConfig';

export const PaymentConfiguration = () => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [config, setConfig] = useState(paymentConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const handleGeneralConfigChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleMethodConfigChange = (method: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [method]: {
          ...prev.methods[method as keyof typeof prev.methods],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const saveChanges = () => {
    // Here we would normally save to database or local storage
    console.log('Saving payment configuration:', config);
    // For demo purposes, just log the changes
    setHasChanges(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuración de Pagos</CardTitle>
        <CardDescription>
          Personalice las opciones del sistema de pagos, métodos disponibles y configuración de impresión.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="methods">Métodos de Pago</TabsTrigger>
            <TabsTrigger value="cash">Efectivo</TabsTrigger>
            <TabsTrigger value="printing">Impresión</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Moneda Predeterminada</Label>
                <Input 
                  id="defaultCurrency" 
                  value={config.general.defaultCurrency} 
                  onChange={(e) => handleGeneralConfigChange('defaultCurrency', e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decimalPlaces">Lugares Decimales</Label>
                <Input 
                  id="decimalPlaces" 
                  type="number" 
                  value={config.general.decimalPlaces} 
                  onChange={(e) => handleGeneralConfigChange('decimalPlaces', parseInt(e.target.value))} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partialPaymentThreshold">Umbral para Pagos Parciales</Label>
                <Input 
                  id="partialPaymentThreshold" 
                  type="number" 
                  value={config.general.partialPaymentThreshold} 
                  onChange={(e) => handleGeneralConfigChange('partialPaymentThreshold', parseInt(e.target.value))} 
                />
                <p className="text-xs text-muted-foreground">Monto mínimo para habilitar pagos parciales</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="methods" className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <BanknoteIcon className="mr-2 h-4 w-4 text-green-600" />
                  <h3 className="text-lg font-medium">Efectivo</h3>
                </div>
                <Switch 
                  checked={config.methods.cash.enabled}
                  onCheckedChange={(value) => handleMethodConfigChange('cash', 'enabled', value)}
                />
              </div>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoChangeCalc">Cálculo automático de cambio</Label>
                  <Switch 
                    id="autoChangeCalc"
                    checked={config.methods.cash.autoCalculateChange}
                    onCheckedChange={(value) => handleMethodConfigChange('cash', 'autoCalculateChange', value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                  <h3 className="text-lg font-medium">Tarjeta</h3>
                </div>
                <Switch 
                  checked={config.methods.card.enabled}
                  onCheckedChange={(value) => handleMethodConfigChange('card', 'enabled', value)}
                />
              </div>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cardConfirmation">Requerir confirmación</Label>
                  <Switch 
                    id="cardConfirmation"
                    checked={config.methods.card.requireConfirmation}
                    onCheckedChange={(value) => handleMethodConfigChange('card', 'requireConfirmation', value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardTimeout">Tiempo de espera (ms)</Label>
                  <Input 
                    id="cardTimeout" 
                    type="number" 
                    value={config.methods.card.timeout} 
                    onChange={(e) => handleMethodConfigChange('card', 'timeout', parseInt(e.target.value))} 
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-purple-600" />
                  <h3 className="text-lg font-medium">Transferencia</h3>
                </div>
                <Switch 
                  checked={config.methods.transfer.enabled}
                  onCheckedChange={(value) => handleMethodConfigChange('transfer', 'enabled', value)}
                />
              </div>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="transferConfirmation">Requerir confirmación</Label>
                  <Switch 
                    id="transferConfirmation"
                    checked={config.methods.transfer.requireConfirmation}
                    onCheckedChange={(value) => handleMethodConfigChange('transfer', 'requireConfirmation', value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cuentas bancarias</Label>
                  <p className="text-xs text-muted-foreground">Configure sus cuentas bancarias en la sección de administración</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cash" className="space-y-4">
            <p>Configuración de denominaciones y manejo de efectivo</p>
            <p className="text-sm text-muted-foreground">(Configuración avanzada)</p>
          </TabsContent>
          
          <TabsContent value="printing" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoPrint">Imprimir automáticamente recibos</Label>
                <Switch 
                  id="autoPrint" 
                  checked={config.printing.autoPrintReceipt}
                  onCheckedChange={(value) => {
                    setConfig(prev => ({
                      ...prev,
                      printing: { ...prev.printing, autoPrintReceipt: value }
                    }));
                    setHasChanges(true);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printPreview">Mostrar vista previa antes de imprimir</Label>
                <Switch 
                  id="printPreview"
                  checked={config.printing.printPreview}
                  onCheckedChange={(value) => {
                    setConfig(prev => ({
                      ...prev,
                      printing: { ...prev.printing, printPreview: value }
                    }));
                    setHasChanges(true);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="copies">Número de copias</Label>
                <Input 
                  id="copies" 
                  type="number" 
                  min={1} 
                  max={3} 
                  value={config.printing.copies}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      printing: { ...prev.printing, copies: parseInt(e.target.value) }
                    }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <Button onClick={saveChanges} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentConfiguration;
