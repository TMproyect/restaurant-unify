// API Endpoint para recibir pedidos externos desde n8n u otras integraciones
// Versión 2.0 - Forzar redespliegue - 2025-04-08
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
  
  return null; // Sin errores
}

// Función para extraer y validar la API Key
async function validateApiKey(supabase: any, apiKey: string): Promise<boolean> {
  if (!apiKey) {
    console.log("Error de validación: API Key no proporcionada");
    return false;
  }
  
  console.log(`Intento de validación de API key: ${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}`);
  console.log("Verificación de API key forzando redespliegue - 2025-04-08");
  
  try {
    // Obtener API key almacenada en system_settings
    const { data, error } = await supabase
      .from('system_settings')
      .select('value, updated_at')
      .eq('key', 'external_api_key')
      .single();
    
    if (error) {
      console.error("Error obteniendo API key de la base de datos:", error.message);
      console.error("Detalles completos del error:", JSON.stringify(error));
      return false;
    }
    
    if (!data || !data.value) {
      console.error("No se encontró una API key configurada en system_settings");
      return false;
    }
    
    console.log(`API key en DB: ${data.value.substring(0, 4)}****${data.value.substring(data.value.length - 4)}, actualizada: ${data.updated_at}`);
    console.log(`API key recibida: ${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}`);
    
    // Comparación insensible a espacios en blanco y comillas
    const storedKey = data.value.trim().replace(/^["']|["']$/g, '');
    const receivedKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const isValid = receivedKey === storedKey;
    
    console.log("¿API key válida?:", isValid);
    
    if (!isValid) {
      console.log("Las API keys no coinciden. Verificando caracteres por caracteres:");
      if (receivedKey.length !== storedKey.length) {
        console.log(`Longitudes diferentes: Recibida (${receivedKey.length}) vs. Almacenada (${storedKey.length})`);
      } else {
        for (let i = 0; i < receivedKey.length; i++) {
          if (receivedKey[i] !== storedKey[i]) {
            console.log(`Diferencia en posición ${i}: '${receivedKey[i]}' vs '${storedKey[i]}'`);
          }
        }
      }
    }
    
    return isValid;
  } catch (e) {
    console.error("Error inesperado al validar API key:", e);
    return false;
  }
}

serve(async (req) => {
  console.log("Función ingresar-pedido v2.0 recibió una solicitud:", req.method);
  console.log("Redespliegue forzado activado - 2025-04-08");
  
  // Imprimir todas las cabeceras recibidas para diagnóstico
  const headerEntries = Array.from(req.headers.entries());
  console.log("Todas las cabeceras recibidas:", JSON.stringify(headerEntries));
  
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
  
  // Obtener la API key del encabezado Authorization
  let apiKey = null;
  
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  
  // Extraer la API key del encabezado Authorization
  if (authHeader) {
    console.log("Se encontró encabezado Authorization:", authHeader.substring(0, 10) + "****");
    // Comprobar si comienza con "Bearer " y extraer el token
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      apiKey = authHeader.substring(7).trim();
      console.log("API Key extraída de encabezado Bearer:", apiKey ? `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}` : 'No proporcionada');
    } else {
      apiKey = authHeader.trim();
      console.log("API Key extraída de Authorization (sin Bearer):", apiKey ? `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}` : 'No proporcionada');
    }
  }
  
  if (!apiKey) {
    console.log("API Key no encontrada en ninguna cabecera");
    console.log("Cabeceras disponibles:", JSON.stringify(headerEntries));
    return new Response(JSON.stringify({ 
      error: "API Key requerida", 
      details: "Debe proporcionar una clave API válida en la cabecera 'Authorization: Bearer <API_KEY>'",
      headers_received: Object.fromEntries(headerEntries)
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Inicializar cliente Supabase sin incluir ningún token de autenticación
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  // Usar directamente el service role key para conectar a la DB sin autenticación JWT
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Validar API Key contra la base de datos
  const isValidApiKey = await validateApiKey(supabase, apiKey);
  if (!isValidApiKey) {
    console.log(`API Key inválida: ${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}`);
    return new Response(JSON.stringify({ 
      error: "API Key inválida",
      details: "La clave API proporcionada no coincide con la clave registrada en el sistema"
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  console.log("✅ Autenticación exitosa con API Key");
  
  try {
    // Procesar el cuerpo de la solicitud
    let payload;
    try {
      payload = await req.json();
      console.log("Payload recibido:", JSON.stringify(payload));
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      return new Response(JSON.stringify({ 
        error: "JSON inválido", 
        details: "El cuerpo de la solicitud no contiene un JSON válido"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
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
      status: payload.estado_pedido_inicial || 'pending',
      total: payload.total_pedido,
      items_count: validatedItems.length,
      is_delivery: !!payload.is_delivery,
      kitchen_id: payload.kitchen_id || null,
      external_id: payload.id_externo || null
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
      return new Response(JSON.stringify({ 
        error: "Error al crear el pedido en el sistema", 
        details: orderError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
    
    console.log("Items del pedido creados exitosamente");
    
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
      
      console.log("Notificación creada exitosamente para el nuevo pedido");
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
