
// Utilidad para procesar los pedidos

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
      
      validatedItems.push({
        menu_item_id: menuItem.id,
        name: item.nombre_personalizado || menuItem.name,
        price: item.precio_unitario || menuItem.price,
        quantity: item.cantidad,
        notes: item.notas_item || ''
      });
    }
    
    // Registrar la fuente del pedido
    const orderSource = payload.order_source || (payload.is_delivery ? 'delivery' : 'pos');
    console.log(`Fuente del pedido (order_source): ${orderSource}`);
    
    // Crear el pedido en la base de datos
    const orderData = {
      customer_name: payload.nombre_cliente,
      table_number: payload.numero_mesa ? parseInt(payload.numero_mesa, 10) : null,
      table_id: payload.table_id || null,
      status: payload.estado_pedido_inicial || 'pending',
      total: payload.total_pedido,
      items_count: validatedItems.length,
      is_delivery: !!payload.is_delivery,
      kitchen_id: payload.kitchen_id || null,
      external_id: payload.id_externo || null,
      order_source: orderSource
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
