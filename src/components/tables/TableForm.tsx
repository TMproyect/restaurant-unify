
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableZone, RestaurantTable } from '@/types/tables';

interface TableFormProps {
  table: RestaurantTable | null;
  zones: TableZone[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const TableForm: React.FC<TableFormProps> = ({ table, zones, onSubmit, onCancel }) => {
  const form = useForm({
    defaultValues: {
      number: table?.number || '',
      capacity: table?.capacity || 4,
      zone: table?.zone || (zones.length > 0 ? zones[0].name : 'main'),
      status: table?.status || 'available',
    },
  });

  const handleSubmit = (data: any) => {
    // Convert number fields to numbers
    data.number = parseInt(data.number);
    data.capacity = parseInt(data.capacity);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Mesa</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
              </FormControl>
              <FormDescription>
                Número único que identifica la mesa en el restaurante.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidad</FormLabel>
              <FormControl>
                <Input type="number" placeholder="4" {...field} />
              </FormControl>
              <FormDescription>
                Número de personas que pueden sentarse en esta mesa.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una zona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {zones.length > 0 ? (
                    zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.name}>
                        {zone.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="main">Principal</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Área del restaurante donde se encuentra la mesa.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Ocupada</SelectItem>
                  <SelectItem value="reserved">Reservada</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Estado actual de la mesa.
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
            {table ? 'Actualizar' : 'Crear'} Mesa
          </Button>
        </div>
      </form>
    </Form>
  );
};
