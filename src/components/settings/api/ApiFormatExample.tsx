
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export const ApiFormatExample = () => {
  return (
    <div className="mt-6 pt-4 border-t">
      <h3 className="text-sm font-medium mb-2">Formato de pedidos</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Los pedidos enviados a la API deben tener el siguiente formato JSON:
      </p>
      <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
{`{
  "nombre_cliente": "Nombre del Cliente", 
  "numero_mesa": "4",                    // O "is_delivery": true para delivery
  "items_pedido": [
    {
      "sku_producto": "PIZZA-MARG-M",   // SKU del producto en el menú
      "cantidad": 2,
      "precio_unitario": 12.50,
      "notas_item": "Sin cebolla"       // Opcional
    }
  ],
  "total_pedido": 25.00,
  "estado_pedido_inicial": "pending"
}`}
      </pre>
      <div className="mt-2 flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <a 
            href="https://supabase.com/dashboard/project/imcxvnivqrckgjrimzck/functions/ingresar-pedido/logs" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Ver logs de la función
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
};
