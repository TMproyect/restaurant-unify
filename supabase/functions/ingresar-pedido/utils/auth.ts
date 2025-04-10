
// Utilidad para validar la API Key

/**
 * Valida la API Key contra la almacenada en la base de datos
 * @param supabase Cliente de Supabase
 * @param apiKey La API Key a validar
 * @returns Boolean indicando si la API Key es válida
 */
export async function validateApiKey(supabase: any, apiKey: string): Promise<boolean> {
  if (!apiKey) {
    console.log("Error de validación: API Key no proporcionada");
    return false;
  }
  
  console.log(`Intento de validación de API key: ${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}`);
  
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
