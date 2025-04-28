
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useArchiveConfig } from '@/contexts/archive/ArchiveConfigContext';
import { toast } from 'sonner';

export default function ArchiveSettings() {
  const { settings, updateSettings } = useArchiveConfig();

  const handleToggleAutoArchive = async (enabled: boolean) => {
    try {
      await updateSettings({ autoArchiveEnabled: enabled });
      toast.success(enabled ? 'Archivado automático activado' : 'Archivado automático desactivado');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    }
  };

  const handleHoursChange = async (field: keyof typeof settings, value: string) => {
    const hours = parseInt(value);
    if (isNaN(hours) || hours < 1) return;

    try {
      await updateSettings({ [field]: hours });
      toast.success('Configuración actualizada');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Archivado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Archivado Automático</Label>
            <p className="text-sm text-muted-foreground">
              Archivar automáticamente órdenes antiguas según los criterios configurados
            </p>
          </div>
          <Switch
            checked={settings.autoArchiveEnabled}
            onCheckedChange={handleToggleAutoArchive}
          />
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="completedOrders">Órdenes Completadas (horas)</Label>
            <Input
              id="completedOrders"
              type="number"
              min="1"
              value={settings.completedOrdersHours}
              onChange={(e) => handleHoursChange('completedOrdersHours', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cancelledOrders">Órdenes Canceladas (horas)</Label>
            <Input
              id="cancelledOrders"
              type="number"
              min="1"
              value={settings.cancelledOrdersHours}
              onChange={(e) => handleHoursChange('cancelledOrdersHours', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="testOrders">Órdenes de Prueba (horas)</Label>
            <Input
              id="testOrders"
              type="number"
              min="1"
              value={settings.testOrdersHours}
              onChange={(e) => handleHoursChange('testOrdersHours', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deleteArchived">Eliminar Órdenes Archivadas (días)</Label>
            <Input
              id="deleteArchived"
              type="number"
              min="1"
              value={settings.deleteArchivedAfterDays}
              onChange={(e) => handleHoursChange('deleteArchivedAfterDays', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
