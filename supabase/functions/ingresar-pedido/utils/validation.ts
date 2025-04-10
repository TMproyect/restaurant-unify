
// Utilidad para validar la estructura del payload del pedido

/**
 * Normaliza un valor numérico que puede venir en formato de cadena con diferentes separadores decimales
 * @param value El valor a normalizar
 * @returns Número normalizado o null si no es un valor válido
 */
function normalizeNumericValue(value: any): number | null {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Intentar convertir el string a número
    // Primero removemos cualquier separador de miles (asumiendo que los decimales usan punto o coma)
    const normalizedString = value
      .replace(/\./g, '') // Remueve separadores de miles si son puntos
      .replace(',', '.'); // Reemplaza coma decimal por punto si existe
    
    const parsedNumber = parseFloat(normalizedString);
    if (!isNaN(parsedNumber)) {
      return parsedNumber;
    }
  }
  
  return null; // No se pudo convertir a número
}

/**
 * Valida la estructura y los datos del payload recibido
 * @param payload El objeto JSON recibido en la solicitud
 * @returns String con el mensaje de error, o null si es válido
 */
export function validatePayload(payload: any): string | null {
  if (!payload) return "Payload vacío o inválido";
  if (!payload.nombre_cliente) return "Campo 'nombre_cliente' es requerido";
  
  // CORRECCIÓN: Validación basada en order_source
  // Si es delivery, no requerir número de mesa
  // Si no es delivery, requerir número de mesa
  const isDelivery = payload.order_source === 'delivery' || payload.is_delivery === true;
  
  if (!isDelivery && !payload.numero_mesa) {
    return "Para pedidos que no son delivery, se requiere 'numero_mesa'";
  }
  
  // Validar array de items
  if (!payload.items_pedido || !Array.isArray(payload.items_pedido) || payload.items_pedido.length === 0) {
    return "Campo 'items_pedido' debe ser un array no vacío";
  }
  
  // Validar cada item del pedido
  for (const item of payload.items_pedido) {
    if (!item.sku_producto) return "Cada item debe tener un 'sku_producto'";
    
    // Validar cantidad (aceptando string o número)
    const cantidad = normalizeNumericValue(item.cantidad);
    if (cantidad === null || cantidad <= 0) {
      return "Cada item debe tener una 'cantidad' válida mayor a cero";
    }
    
    // Validar precio unitario (aceptando string o número)
    const precioUnitario = normalizeNumericValue(item.precio_unitario);
    if (precioUnitario === null || precioUnitario < 0) {
      return "Cada item debe tener un 'precio_unitario' válido";
    }
  }
  
  // Validar total (aceptando string o número)
  const totalPedido = normalizeNumericValue(payload.total_pedido);
  if (totalPedido === null || totalPedido < 0) {
    return "Campo 'total_pedido' debe ser un número válido";
  }
  
  // Validar order_source si está presente
  if (payload.order_source && !['delivery', 'qr_table', 'pos'].includes(payload.order_source)) {
    return "El campo 'order_source' debe ser uno de: 'delivery', 'qr_table', 'pos'";
  }
  
  return null; // Sin errores
}
