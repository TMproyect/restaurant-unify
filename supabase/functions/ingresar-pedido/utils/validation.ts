
// Utilidad para validar la estructura del payload del pedido

/**
 * Valida la estructura y los datos del payload recibido
 * @param payload El objeto JSON recibido en la solicitud
 * @returns String con el mensaje de error, o null si es válido
 */
export function validatePayload(payload: any): string | null {
  if (!payload) return "Payload vacío o inválido";
  if (!payload.nombre_cliente) return "Campo 'nombre_cliente' es requerido";
  
  // Validar si es para mesa o delivery
  if (!payload.numero_mesa && !payload.is_delivery) {
    return "Se requiere 'numero_mesa' o indicar que es delivery con 'is_delivery: true'";
  }
  
  // Validar array de items
  if (!payload.items_pedido || !Array.isArray(payload.items_pedido) || payload.items_pedido.length === 0) {
    return "Campo 'items_pedido' debe ser un array no vacío";
  }
  
  // Validar cada item del pedido
  for (const item of payload.items_pedido) {
    if (!item.sku_producto) return "Cada item debe tener un 'sku_producto'";
    if (!item.cantidad || typeof item.cantidad !== 'number' || item.cantidad <= 0) {
      return "Cada item debe tener una 'cantidad' válida mayor a cero";
    }
    if (item.precio_unitario === undefined || typeof item.precio_unitario !== 'number' || item.precio_unitario < 0) {
      return "Cada item debe tener un 'precio_unitario' válido";
    }
  }
  
  // Validar total
  if (payload.total_pedido === undefined || typeof payload.total_pedido !== 'number' || payload.total_pedido < 0) {
    return "Campo 'total_pedido' debe ser un número válido";
  }
  
  // Validar order_source si está presente
  if (payload.order_source && !['delivery', 'qr_table', 'pos'].includes(payload.order_source)) {
    return "El campo 'order_source' debe ser uno de: 'delivery', 'qr_table', 'pos'";
  }
  
  return null; // Sin errores
}
