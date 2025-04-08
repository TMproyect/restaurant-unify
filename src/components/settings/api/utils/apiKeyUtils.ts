
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Generates a secure random API key
 * @returns A 48-character hexadecimal string
 */
export const generateSecureApiKey = (): string => {
  const randomBytes = new Uint8Array(24);
  window.crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Saves an API key to the database
 * @param apiKey The API key to save
 * @returns Result of the database operation
 */
export const saveApiKeyToDatabase = async (apiKey: string) => {
  console.log("Saving API key to database:", apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length - 4));
  
  return await supabase
    .from('system_settings')
    .upsert({ 
      key: 'external_api_key',
      value: apiKey,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
};

/**
 * Tests an API key against the ingresar-pedido endpoint
 * @param apiKey The API key to test
 * @returns Result object with status and message
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
    
    // Simple test payload
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

    console.log("Testing API key:", apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length - 4));
    console.log("Endpoint:", testEndpoint);
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    };
    
    const response = await fetch(testEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testPayload)
    });

    console.log("Response status:", response.status);
    
    const responseText = await response.text();
    console.log("Response text:", responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      result = { error: `Invalid JSON response: ${responseText}` };
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
    console.error('Error testing API key:', error);
    return {
      status: 'error' as const,
      message: `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`
    };
  }
};
