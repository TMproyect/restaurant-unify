
// API Endpoint para recibir pedidos externos desde n8n u otras integraciones
// Versión 3.2 - Actualizado para mejor compatibilidad con n8n - 2025-04-10
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { validatePayload } from './utils/validation.ts';
import { validateApiKey } from './utils/auth.ts';
import { processOrder } from './utils/orderProcessing.ts';
import { createNotification } from './utils/notifications.ts';

serve(async (req) => {
  console.log("Función ingresar-pedido v3.2 recibió una solicitud:", req.method);
  console.log("Versión actualizada con mejor compatibilidad con n8n - 2025-04-10");
  
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
  
  // Obtener la API key de cualquiera de los encabezados posibles
  let apiKey = null;
  
  // 1. Intentar obtener de cabecera Authorization (Bearer token)
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
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
  
  // 2. Si no hay Authorization, intentar con x-api-key (compatibilidad con n8n)
  if (!apiKey) {
    const xApiKey = req.headers.get('x-api-key');
    if (xApiKey) {
      apiKey = xApiKey.trim();
      console.log("API Key extraída de x-api-key:", apiKey ? `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}` : 'No proporcionada');
    }
  }
  
  if (!apiKey) {
    console.log("API Key no encontrada en ninguna cabecera");
    console.log("Cabeceras disponibles:", JSON.stringify(headerEntries));
    return new Response(JSON.stringify({ 
      error: "API Key requerida", 
      details: "Debe proporcionar una clave API válida en la cabecera 'Authorization: Bearer <API_KEY>' o 'x-api-key: <API_KEY>'",
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

    // Procesar la orden y obtener resultado
    const orderResult = await processOrder(supabase, payload);
    
    if (orderResult.error) {
      console.error("Error procesando el pedido:", orderResult.error);
      return new Response(JSON.stringify({ 
        error: orderResult.error, 
        details: orderResult.details || "Error al procesar el pedido"
      }), {
        status: orderResult.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Crear notificación para el nuevo pedido
    try {
      await createNotification(supabase, {
        title: "Nuevo pedido externo",
        description: `${payload.nombre_cliente} - Mesa ${payload.numero_mesa || 'Delivery'} - ${payload.items_pedido.length} ítems`,
        type: "order",
        user_id: null, // Se notificará a todos los usuarios
        link: `/orders?id=${orderResult.order.id}`,
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
      pos_order_id: orderResult.order.id,
      created_at: orderResult.order.created_at,
      order_source: orderResult.orderSource
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
