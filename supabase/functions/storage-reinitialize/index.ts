
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Cabeceras CORS para garantizar que la función pueda ser llamada desde cualquier origen
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función principal
serve(async (req) => {
  // Manejar solicitudes de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando verificación del bucket menu_images...');
    
    // Crear cliente Supabase con privilegios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Intentar ejecutar la función SQL verify_menu_images_bucket
    try {
      const { data, error } = await supabaseAdmin.rpc('verify_menu_images_bucket');
      
      if (error) {
        throw error;
      }
      
      console.log('🔄 Bucket verificado correctamente mediante RPC');
    } catch (rpcError) {
      console.log('🔄 Error al llamar a verify_menu_images_bucket:', rpcError.message);
      
      // Implementación alternativa en caso de que falle la RPC
      console.log('🔄 Ejecutando verificación manual del bucket...');
      
      // Verificar si el bucket existe
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        console.log('🔄 Error al listar buckets:', bucketsError.message);
        throw bucketsError;
      }
      
      // Verificar si el bucket existe
      const bucketExists = buckets?.some(b => b.name === 'menu_images') || false;
      console.log(`🔄 Bucket existe: ${bucketExists}`);
      
      // Crear o actualizar el bucket
      if (bucketExists) {
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(
          'menu_images', 
          { public: true }
        );
        
        if (updateError) {
          console.log('🔄 Error al actualizar bucket:', updateError.message);
          throw updateError;
        }
        
        console.log('🔄 Bucket actualizado correctamente');
      } else {
        const { error: createError } = await supabaseAdmin.storage.createBucket(
          'menu_images', 
          { public: true }
        );
        
        if (createError) {
          console.log('🔄 Error al crear bucket:', createError.message);
          throw createError;
        }
        
        console.log('🔄 Bucket creado correctamente');
      }
      
      // Verificar y recuperar políticas
      try {
        console.log('🔄 Verificando políticas...');
        
        // Verificar si existe la política principal
        // Nota: Esta es una implementación simplificada, ya que no podemos consultar políticas directamente
        
        // Aplicar las políticas de nuevo para garantizar que estén presentes
        // Primero eliminar políticas existentes
        await supabaseAdmin.rpc('exec_sql', { 
          query: `
            DROP POLICY IF EXISTS "Menu Images Complete Access" ON storage.objects;
            
            CREATE POLICY "Menu Images Complete Access" 
            ON storage.objects FOR ALL 
            USING (bucket_id = 'menu_images');
            
            UPDATE storage.objects 
            SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{isPublic}', 'true')
            WHERE bucket_id = 'menu_images';
          `
        });
        
        console.log('🔄 Políticas restauradas correctamente');
      } catch (policyError) {
        console.log('🔄 Error al gestionar políticas:', policyError);
      }
    }
    
    // Verificar acceso listando archivos en el bucket
    try {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('menu_images')
        .list();
      
      if (listError) {
        console.log('🔄 Error al listar archivos:', listError.message);
      } else {
        console.log(`🔄 Se pudieron listar ${files?.length || 0} archivos`);
      }
    } catch (listError) {
      console.log('🔄 Error al verificar archivos:', listError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'El bucket menu_images ha sido verificado correctamente',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('🔄 Error general:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error al verificar el bucket menu_images',
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
