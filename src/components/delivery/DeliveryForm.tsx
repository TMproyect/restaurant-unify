
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createDeliveryOrder } from "@/services/delivery";
import { useToast } from "@/hooks/use-toast";

// Define the form validation schema
const deliveryFormSchema = z.object({
  customerName: z.string().min(2, { message: "El nombre del cliente es requerido" }),
  phoneNumber: z.string().min(6, { message: "El número de teléfono es requerido" }),
  street: z.string().min(3, { message: "La dirección es requerida" }),
  city: z.string().min(2, { message: "La ciudad es requerida" }),
  state: z.string().min(2, { message: "El estado/provincia es requerido" }),
  zip: z.string().min(2, { message: "El código postal es requerido" }),
  instructions: z.string().optional(),
  total: z.coerce.number().min(1, { message: "El total debe ser mayor a 0" }),
  itemsCount: z.coerce.number().min(1, { message: "Debe incluir al menos un ítem" }),
});

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>;

interface DeliveryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  
  // Initialize the form with default values
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      instructions: "",
      total: 0,
      itemsCount: 1,
    },
  });

  const onSubmit = async (data: DeliveryFormValues) => {
    try {
      // Create a new delivery order
      const newDelivery = await createDeliveryOrder(
        {
          customer_name: data.customerName,
          table_number: null,
          table_id: null,
          status: "pending",
          total: data.total,
          items_count: data.itemsCount,
          is_delivery: true,
          kitchen_id: null,
        },
        // In a real app, we would have actual order items here
        [{
          menu_item_id: null,
          name: "Pedido de delivery",
          price: data.total,
          quantity: 1,
          notes: data.instructions,
        }],
        {
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
            instructions: data.instructions,
          },
          phone_number: data.phoneNumber,
        }
      );

      if (newDelivery) {
        toast({
          title: "Entrega creada",
          description: "La entrega ha sido creada correctamente",
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la entrega",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la entrega",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Número de contacto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Calle y número" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Ciudad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado/Provincia</FormLabel>
                <FormControl>
                  <Input placeholder="Estado o provincia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal</FormLabel>
                <FormControl>
                  <Input placeholder="Código postal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrucciones de Entrega</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional para el repartidor"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="itemsCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad de Ítems</FormLabel>
                <FormControl>
                  <Input type="number" min="1" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Crear Entrega</Button>
        </div>
      </form>
    </Form>
  );
};

export default DeliveryForm;
