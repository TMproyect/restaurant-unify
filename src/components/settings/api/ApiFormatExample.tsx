
import React from 'react';
import { Card, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Code, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
        
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Importante: Formato de valores numéricos</AlertTitle>
          <AlertDescription>
            Los valores numéricos deben utilizar punto como separador decimal (ej: 8.50) y no deben incluir separadores de miles.
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>✅ <code className="bg-muted px-1 py-0.5 rounded">8.50</code></div>
              <div>❌ <code className="bg-muted px-1 py-0.5 rounded">8,50</code></div>
              <div>✅ <code className="bg-muted px-1 py-0.5 rounded">1250.75</code></div>
              <div>❌ <code className="bg-muted px-1 py-0.5 rounded">1,250.75</code> o <code className="bg-muted px-1 py-0.5 rounded">1.250,75</code></div>
            </div>
          </AlertDescription>
        </Alert>
        
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
