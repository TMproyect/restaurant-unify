
// API Endpoint para recibir pedidos externos desde n8n u otras integraciones
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuración para CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Validar estructura del payload
function validatePayload(payload: any): string | null {
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
  
  // Validar estado inicial
  if (!payload.estado_pedido_inicial) {
    return "Campo 'estado_pedido_inicial' es requerido";
  }

  return null; // Sin errores
}

// Validar API Key
async function validateApiKey(supabase: any, apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  // Obtener API key almacenada en system_settings
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'external_api_key')
    .single();
  
  if (error || !data) {
    console.error("Error validando API key:", error);
    return false;
  }
  
  return apiKey === data.value;
}

serve(async (req) => {
  console.log("Función ingresar-pedido recibió una solicitud:", req.method);
  
  // Manejar solicitudes OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    console.log("Procesando solicitud OPTIONS para CORS");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Verificar que sea un método POST
  if (req.method !== 'POST') {
    console.log("Método no permitido:", req.method);
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Obtener la API key del encabezado
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    console.log("API Key no proporcionada");
    return new Response(JSON.stringify({ error: "API Key requerida" }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Inicializar cliente Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Validar API Key
  const isValidApiKey = await validateApiKey(supabase, apiKey);
  if (!isValidApiKey) {
    console.log("API Key inválida:", apiKey);
    return new Response(JSON.stringify({ error: "API Key inválida" }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Procesar el cuerpo de la solicitud
    const payload = await req.json();
    
    // Validar estructura del payload
    const validationError = validatePayload(payload);
    if (validationError) {
      console.log("Error de validación del payload:", validationError);
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
        return new Response(JSON.stringify({ 
          error: `SKU no encontrado: ${item.sku_producto}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      validatedItems.push({
        menu_item_id: menuItem.id,
        name: item.nombre_personalizado || menuItem.name,
        price: item.precio_unitario || menuItem.price,
        quantity: item.cantidad,
        notes: item.notas_item || ''
      });
    }
    
    // Crear el pedido en la base de datos
    const orderData = {
      customer_name: payload.nombre_cliente,
      table_number: payload.numero_mesa ? parseInt(payload.numero_mesa, 10) : null,
      table_id: payload.table_id || null,
      status: payload.estado_pedido_inicial,
      total: payload.total_pedido,
      items_count: validatedItems.length,
      is_delivery: !!payload.is_delivery,
      kitchen_id: payload.kitchen_id || null,
      external_id: payload.id_externo || null
    };
    
    // Insertar el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) {
      console.error("Error creando el pedido:", orderError);
      return new Response(JSON.stringify({ 
        error: "Error al crear el pedido en el sistema", 
        details: orderError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Insertar los items del pedido
    const orderItems = validatedItems.map(item => ({
      ...item,
      order_id: order.id
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error("Error creando los items del pedido:", itemsError);
      // Aunque falló al insertar items, el pedido ya fue creado
      // En un sistema real, podríamos considerar eliminar el pedido en este caso
      return new Response(JSON.stringify({ 
        error: "Error al crear los items del pedido", 
        details: itemsError.message,
        order_id: order.id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Crear notificación para el nuevo pedido
    try {
      await supabase
        .from('notifications')
        .insert({
          title: "Nuevo pedido externo",
          description: `${payload.nombre_cliente} - ${validatedItems.length} ítems`,
          type: "order",
          user_id: null, // Se notificará a todos los usuarios
          link: `/orders?id=${order.id}`,
          action_text: "Ver pedido"
        });
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError);
      // No interrumpimos el flujo por un error en la notificación
    }
    
    // Devolver respuesta exitosa
    return new Response(JSON.stringify({
      success: true,
      message: "Pedido creado correctamente",
      pos_order_id: order.id,
      created_at: order.created_at
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error procesando el pedido:", error);
    return new Response(JSON.stringify({ 
      error: "Error interno del servidor", 
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
