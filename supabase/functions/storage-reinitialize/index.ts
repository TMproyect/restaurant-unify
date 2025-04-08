
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configuración CORS para permitir solicitudes desde cualquier origen
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejo de solicitudes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Crear cliente Supabase utilizando variables de entorno
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificación de autenticación
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado - Se requiere cabecera de autorización' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Intentar recrear el bucket menu_images
    console.log('Inicializando bucket menu_images...');
    
    // 1. Verificar si el bucket existe
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    if (bucketsError) {
      console.error('Error al listar buckets:', bucketsError);
      throw bucketsError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'menu_images');
    console.log(`Bucket menu_images existe: ${bucketExists}`);

    // 2. Crear o actualizar el bucket según sea necesario
    if (bucketExists) {
      // Actualizar el bucket existente
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('menu_images', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (updateError) {
        console.error('Error al actualizar bucket:', updateError);
        throw updateError;
      }
      
      console.log('Bucket menu_images actualizado correctamente');
    } else {
      // Crear nuevo bucket
      const { error: createError } = await supabaseAdmin.storage.createBucket('menu_images', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (createError) {
        console.error('Error al crear bucket:', createError);
        throw createError;
      }
      
      console.log('Bucket menu_images creado correctamente');
    }

    // 3. Ejecutar SQL personalizado para crear políticas de almacenamiento adecuadas
    const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('initialize_menu_images_bucket');
    
    if (sqlError) {
      console.error('Error al ejecutar SQL para políticas:', sqlError);
      // Continuar de todos modos ya que podríamos tener éxito parcial
      console.log('Continuando con inicialización parcial...');
    } else {
      console.log('Políticas de acceso aplicadas correctamente');
    }

    // Retornar respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bucket menu_images inicializado correctamente',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
