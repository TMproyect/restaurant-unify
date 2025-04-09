
import React from 'react';
import { Card, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Code } from 'lucide-react';

export const ApiFormatExample = () => {
  const exampleJson = `{
  "nombre_cliente": "Juan Pérez",
  "numero_mesa": "5",
  "items_pedido": [
    {
      "sku_producto": "HAM001",
      "cantidad": 2,
      "precio_unitario": 8.50,
      "notas_item": "Sin cebolla"
    },
    {
      "sku_producto": "BEBCOC001",
      "cantidad": 1,
      "precio_unitario": 5.00
    }
  ],
  "total_pedido": 22.00,
  "notas_generales_pedido": "Cliente frecuente",
  "id_externo": "order-123456",
  "order_source": "delivery"
}`;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-2">
          <Code size={16} />
          <CardTitle className="text-base">Formato JSON</CardTitle>
        </div>
        <CardDescription className="mb-4">
          Ejemplo del formato JSON que debe enviarse en el cuerpo de la solicitud POST
        </CardDescription>
        <div className="bg-muted rounded-md p-4 overflow-x-auto">
          <pre className="text-xs md:text-sm whitespace-pre-wrap">{exampleJson}</pre>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p><strong>Campos obligatorios:</strong> nombre_cliente, numero_mesa (o is_delivery=true), items_pedido, total_pedido</p>
          <p><strong>Campos opcionales:</strong> notas_generales_pedido, id_externo, kitchen_id, estado_pedido_inicial, order_source</p>
          <p className="mt-2">
            <strong>order_source:</strong> Valores permitidos: "delivery", "qr_table", "pos" (indica la fuente del pedido)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
