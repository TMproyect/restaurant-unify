
import React from 'react';

const FieldDescriptionTable: React.FC = () => {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-medium">Descripción de los Campos</h3>
      
      <div className="border rounded-lg divide-y">
        <div className="grid grid-cols-12 p-2 font-medium bg-muted">
          <div className="col-span-3">Campo</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2">Requerido</div>
          <div className="col-span-5">Descripción</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">id_externo</div>
          <div className="col-span-2">string</div>
          <div className="col-span-2">No</div>
          <div className="col-span-5">ID del pedido en el sistema externo</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">nombre_cliente</div>
          <div className="col-span-2">string</div>
          <div className="col-span-2">Sí</div>
          <div className="col-span-5">Nombre del cliente que realiza el pedido</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">numero_mesa</div>
          <div className="col-span-2">string</div>
          <div className="col-span-2">Condicional</div>
          <div className="col-span-5">Requerido si no se especifica is_delivery</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">is_delivery</div>
          <div className="col-span-2">boolean</div>
          <div className="col-span-2">Condicional</div>
          <div className="col-span-5">Requerido si no se especifica numero_mesa</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">items_pedido</div>
          <div className="col-span-2">array</div>
          <div className="col-span-2">Sí</div>
          <div className="col-span-5">Lista de productos del pedido</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">items_pedido[].sku_producto</div>
          <div className="col-span-2">string</div>
          <div className="col-span-2">Sí</div>
          <div className="col-span-5">SKU único del producto en el sistema</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">items_pedido[].cantidad</div>
          <div className="col-span-2">integer</div>
          <div className="col-span-2">Sí</div>
          <div className="col-span-5">Cantidad del producto</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">items_pedido[].precio_unitario</div>
          <div className="col-span-2">number</div>
          <div className="col-span-2">Sí</div>
          <div className="col-span-5">Precio por unidad del producto</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">items_pedido[].notas_item</div>
          <div className="col-span-2">string</div>
          <div className="col-span-2">No</div>
          <div className="col-span-5">Notas específicas para el producto</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">total_pedido</div>
          <div className="col-span-2">number</div>
          <div className="col-span-2">Sí</div>
          <div className="col-span-5">Monto total del pedido</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">notas_generales_pedido</div>
          <div className="col-span-2">string</div>
          <div className="col-span-2">No</div>
          <div className="col-span-5">Notas generales para todo el pedido</div>
        </div>
        
        <div className="grid grid-cols-12 p-2">
          <div className="col-span-3 font-mono text-sm">estado_pedido_inicial</div>
          <div className="col-span-2">string</div>
          <div className="col-span-2">Sí</div>
          <div className="col-span-5">Estado inicial del pedido (pendiente, preparando, etc.)</div>
        </div>
      </div>
    </div>
  );
};

export default FieldDescriptionTable;
