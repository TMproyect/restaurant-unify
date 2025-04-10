
// Utilidad para procesar los pedidos

/**
 * Normaliza un valor numérico que puede venir en formato de cadena con diferentes separadores decimales
 * @param value El valor a normalizar
 * @returns Número normalizado
 */
function normalizeNumericValue(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Primero removemos cualquier separador de miles (asumiendo que los decimales usan punto o coma)
    const normalizedString = value
      .replace(/\./g, '') // Remueve separadores de miles si son puntos
      .replace(',', '.'); // Reemplaza coma decimal por punto si existe
    
    const parsedNumber = parseFloat(normalizedString);
    if (!isNaN(parsedNumber)) {
      return parsedNumber;
    }
  }
  
  // Si no se puede convertir, devolvemos 0 como valor predeterminado
  return 0;
}

/**
 * Procesa un pedido recibido
 * @param supabase Cliente de Supabase
 * @param payload Datos del pedido
 * @returns Objeto con resultado del procesamiento
 */
export async function processOrder(supabase: any, payload: any) {
  try {
    // Procesamiento de los items: validar SKUs y obtener datos de menú
    const validatedItems = [];
    for (const item of payload.items_pedido) {
      // Buscar el producto por SKU
      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .eq('sku', item.sku_producto)
        .single();
      
      if (menuError || !menuItem) {
        console.log("SKU no encontrado:", item.sku_producto);
        return { 
          error: `SKU no encontrado: ${item.sku_producto}`,
          status: 400
        };
      }
      
      // Normalizar valores numéricos
      const cantidad = normalizeNumericValue(item.cantidad);
      const precioUnitario = normalizeNumericValue(item.precio_unitario) || menuItem.price;
      
      validatedItems.push({
        menu_item_id: menuItem.id,
        name: item.nombre_personalizado || menuItem.name,
        price: precioUnitario,
        quantity: cantidad,
        notes: item.notas_item || ''
      });
    }
    
    // Determinar la fuente del pedido
    // CORRECCIÓN: Implementar lógica mejorada para detectar delivery
    const isDelivery = payload.order_source === 'delivery' || payload.is_delivery === true;
    const orderSource = payload.order_source || (isDelivery ? 'delivery' : 'pos');
    console.log(`Fuente del pedido (order_source): ${orderSource}`);
    
    // Normalizar número de mesa (puede ser string)
    // CORRECCIÓN: Para delivery, forzar tableNumber a null
    let tableNumber = null;
    if (!isDelivery && payload.numero_mesa) {
      if (typeof payload.numero_mesa === 'number') {
        tableNumber = payload.numero_mesa;
      } else {
        // Intentar convertir a número
        const parsedNumber = parseInt(payload.numero_mesa, 10);
        if (!isNaN(parsedNumber)) {
          tableNumber = parsedNumber;
        }
      }
    }
    
    // Normalizar total del pedido
    const totalPedido = normalizeNumericValue(payload.total_pedido);
    
    // CORRECCIÓN: Procesar notas generales del pedido
    const generalNotes = payload.notas_generales_pedido || null;
    console.log("Notas generales del pedido:", generalNotes);
    
    // Crear el pedido en la base de datos
    const orderData = {
      customer_name: payload.nombre_cliente,
      table_number: tableNumber,
      table_id: payload.table_id || null,
      status: payload.estado_pedido_inicial || 'pending',
      total: totalPedido,
      items_count: validatedItems.length,
      is_delivery: isDelivery,
      kitchen_id: payload.kitchen_id || null,
      external_id: payload.id_externo || null,
      order_source: orderSource,
      general_notes: generalNotes // CORRECCIÓN: Añadir notas generales
    };
    
    console.log("Creando nuevo pedido con datos:", JSON.stringify(orderData));
    
    // Insertar el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) {
      console.error("Error creando el pedido:", orderError);
      return { 
        error: "Error al crear el pedido en el sistema", 
        details: orderError.message,
        status: 500
      };
    }
    
    console.log("Pedido creado exitosamente con ID:", order.id);
    
    // Insertar los items del pedido
    const orderItems = validatedItems.map(item => ({
      ...item,
      order_id: order.id
    }));
    
    console.log("Insertando", orderItems.length, "items para el pedido");
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error("Error creando los items del pedido:", itemsError);
      // Aunque falló al insertar items, el pedido ya fue creado
      return { 
        error: "Error al crear los items del pedido", 
        details: itemsError.message,
        order_id: order.id,
        status: 500
      };
    }
    
    console.log("Items del pedido creados exitosamente");
    
    return {
      success: true,
      order,
      orderSource
    };
  } catch (error) {
    console.error("Error inesperado procesando el pedido:", error);
    return {
      error: "Error interno del servidor",
      details: error.message,
      status: 500
    };
  }
}
