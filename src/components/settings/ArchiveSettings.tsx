
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Loader2, Info, Archive, Clock, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const defaultArchiveSettings = {
  auto_archive_enabled: true,
  completed_hours: 24,
  cancelled_hours: 48,
  test_orders_hours: 12,
  auto_delete_enabled: false,
  delete_archived_days: 30
};

const ArchiveSettings = () => {
  const [settings, setSettings] = useState(defaultArchiveSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Fetch settings from database
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'auto_archive_enabled',
          'completed_hours',
          'cancelled_hours',
          'test_orders_hours',
          'auto_delete_enabled',
          'delete_archived_days'
        ]);
        
      if (error) throw error;
      
      // Convert array of {key, value} to object
      const newSettings = {...defaultArchiveSettings};
      if (data) {
        data.forEach(item => {
          if (item.key === 'auto_archive_enabled' || item.key === 'auto_delete_enabled') {
            newSettings[item.key] = item.value === 'true';
          } else {
            newSettings[item.key] = parseInt(item.value) || newSettings[item.key];
          }
        });
      }
      
      setSettings(newSettings);
    } catch (error) {
      console.error('Error al cargar configuración de archivado:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Convert settings to array of {key, value} objects
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString(),
        updated_at: new Date().toISOString()
      }));
      
      // Upsert settings to database
      const { error } = await supabase
        .from('system_settings')
        .upsert(settingsArray);
      
      if (error) throw error;
      
      toast.success('Configuración de archivado guardada correctamente');
    } catch (error) {
      console.error('Error al guardar configuración de archivado:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                Archivado Automático
              </CardTitle>
              <CardDescription>
                Configure cuándo se archivan automáticamente los pedidos antiguos
              </CardDescription>
            </div>
            <Switch 
              checked={settings.auto_archive_enabled} 
              onCheckedChange={(checked) => setSettings({...settings, auto_archive_enabled: checked})}
              aria-label="Habilitar archivado automático"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-medium">Tiempos de archivado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="completedHours" className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Pedidos completados
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Tiempo después del cual los pedidos completados o entregados se archivan automáticamente</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="completedHours"
                        type="number"
                        min={1}
                        max={720}
                        value={settings.completed_hours}
                        onChange={(e) => setSettings({...settings, completed_hours: parseInt(e.target.value) || 24})}
                        className="max-w-[100px]"
                      />
                      <span className="text-sm text-muted-foreground">horas</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="cancelledHours" className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Pedidos cancelados
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Tiempo después del cual los pedidos cancelados se archivan automáticamente</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="cancelledHours"
                        type="number"
                        min={1}
                        max={720}
                        value={settings.cancelled_hours}
                        onChange={(e) => setSettings({...settings, cancelled_hours: parseInt(e.target.value) || 48})}
                        className="max-w-[100px]"
                      />
                      <span className="text-sm text-muted-foreground">horas</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="testOrdersHours" className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Pedidos de prueba
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Tiempo después del cual los pedidos pendientes sin procesar (probablemente de prueba) se archivan automáticamente</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="testOrdersHours"
                        type="number"
                        min={1}
                        max={720}
                        value={settings.test_orders_hours}
                        onChange={(e) => setSettings({...settings, test_orders_hours: parseInt(e.target.value) || 12})}
                        className="max-w-[100px]"
                      />
                      <span className="text-sm text-muted-foreground">horas</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Eliminación automática de archivos
                  </h3>
                  <Switch 
                    checked={settings.auto_delete_enabled} 
                    onCheckedChange={(checked) => setSettings({...settings, auto_delete_enabled: checked})}
                    aria-label="Habilitar eliminación automática"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="deleteArchivedDays" className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Eliminar archivos después de
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Los pedidos archivados se eliminarán permanentemente después de este periodo</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="deleteArchivedDays"
                      type="number"
                      min={1}
                      max={365}
                      disabled={!settings.auto_delete_enabled}
                      value={settings.delete_archived_days}
                      onChange={(e) => setSettings({...settings, delete_archived_days: parseInt(e.target.value) || 30})}
                      className="max-w-[100px]"
                    />
                    <span className="text-sm text-muted-foreground">días</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-between">
          <p className="text-xs text-muted-foreground">
            El archivado automático se ejecuta periódicamente en segundo plano
          </p>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
            Guardar Configuración
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default ArchiveSettings;
