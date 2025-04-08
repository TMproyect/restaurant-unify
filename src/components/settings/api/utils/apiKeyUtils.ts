
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Genera una clave API segura aleatoria
 * @returns Un string hexadecimal de 48 caracteres
 */
export const generateSecureApiKey = (): string => {
  const randomBytes = new Uint8Array(24);
  window.crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Guarda una clave API en la base de datos
 * @param apiKey La clave API a guardar
 * @returns Resultado de la operación en la base de datos
 */
export const saveApiKeyToDatabase = async (apiKey: string) => {
  console.log("Guardando clave API en la base de datos:", apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length - 4));
  
  return await supabase
    .from('system_settings')
    .upsert({ 
      key: 'external_api_key',
      value: apiKey,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
};

/**
 * Prueba una clave API contra el endpoint ingresar-pedido
 * @param apiKey La clave API a probar
 * @returns Objeto con el resultado de la prueba (status y message)
 */
export const testApiKey = async (apiKey: string) => {
  if (!apiKey || apiKey === 'exists') {
    return {
      status: 'error' as const,
      message: "No hay una clave API visible para probar"
    };
  }
  
  try {
    const projectId = 'imcxvnivqrckgjrimzck';
    const testEndpoint = `https://${projectId}.supabase.co/functions/v1/ingresar-pedido`;
    
    // Payload de prueba simple
    const testPayload = {
      nombre_cliente: "Cliente de Prueba API",
      numero_mesa: "1",
      items_pedido: [
        {
          sku_producto: "TEST-SKU",
          cantidad: 1,
          precio_unitario: 10.0
        }
      ],
      total_pedido: 10.0
    };

    console.log("Probando clave API:", apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length - 4));
    console.log("Endpoint:", testEndpoint);
    
    // Actualización: Usar Authorization Bearer en lugar de x-api-key
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    const response = await fetch(testEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testPayload)
    });

    console.log("Código de estado de respuesta:", response.status);
    
    const responseText = await response.text();
    console.log("Texto de respuesta:", responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      result = { error: `Respuesta JSON inválida: ${responseText}` };
    }
    
    if (response.ok) {
      return {
        status: 'success' as const,
        message: "La clave API funciona correctamente"
      };
    } else {
      const errorDetail = result.error || result.message || "Respuesta inválida";
      return {
        status: 'error' as const,
        message: `Error: ${errorDetail}`
      };
    }
  } catch (error) {
    console.error('Error al probar la clave API:', error);
    return {
      status: 'error' as const,
      message: `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`
    };
  }
};
