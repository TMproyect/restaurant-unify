
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, Save } from 'lucide-react';

interface KitchenSettingsProps {
  initialThreshold: number;
  onThresholdChange: (value: number) => void;
}

const KitchenSettings: React.FC<KitchenSettingsProps> = ({ 
  initialThreshold,
  onThresholdChange 
}) => {
  const [urgencyThreshold, setUrgencyThreshold] = useState(initialThreshold);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Save to Supabase
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key: 'kitchen_urgency_threshold_minutes',
          value: urgencyThreshold.toString(),
          updated_at: new Date().toISOString() 
        });
      
      if (error) {
        throw error;
      }
      
      // Update parent component
      onThresholdChange(urgencyThreshold);
      
      toast.success('Configuración de cocina guardada correctamente');
    } catch (error) {
      console.error('Error al guardar configuración de cocina:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Cocina</CardTitle>
        <CardDescription>
          Configure los parámetros de funcionamiento de la cocina
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="urgencyThreshold" className="flex items-center gap-2">
            <Clock size={16} />
            Tiempo Máximo de Preparación (minutos)
          </Label>
          <div className="flex gap-2">
            <Input
              id="urgencyThreshold"
              type="number"
              min={1}
              max={120}
              value={urgencyThreshold}
              onChange={(e) => setUrgencyThreshold(parseInt(e.target.value) || 15)}
              className="max-w-[200px]"
            />
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Guardar
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Los pedidos que superen este tiempo se marcarán como urgentes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KitchenSettings;
