
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TableZone } from '@/types/tables';

interface ZoneFormProps {
  zone: TableZone | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ZoneForm: React.FC<ZoneFormProps> = ({ zone, onSubmit, onCancel }) => {
  const form = useForm({
    defaultValues: {
      name: zone?.name || '',
      description: zone?.description || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Zona</FormLabel>
              <FormControl>
                <Input placeholder="Ejemplo: Terraza" {...field} />
              </FormControl>
              <FormDescription>
                Nombre único que identifica esta zona en el restaurante.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa la zona..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Una breve descripción de esta zona (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {zone ? 'Actualizar' : 'Crear'} Zona
          </Button>
        </div>
      </form>
    </Form>
  );
};
