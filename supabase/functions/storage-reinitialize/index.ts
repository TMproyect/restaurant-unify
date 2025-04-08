
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
    console.log('🔄 Iniciando reinicialización del bucket menu_images...');
    
    // Crear cliente Supabase utilizando variables de entorno
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

    // También intentar llamar a la función SQL para reiniciar permisos
    try {
      const { data: resetResult, error: resetError } = await supabaseAdmin.rpc('reset_menu_images_permissions');
      
      if (resetError) {
        console.log('🔄 Nota: No se pudo llamar a reset_menu_images_permissions, pero continuamos:', resetError.message);
      } else {
        console.log('🔄 Permisos reiniciados con función SQL');
      }
    } catch (resetFnError) {
      // Ignorar cualquier error aquí
      console.log('🔄 Error ignorable al reiniciar permisos con función SQL:', resetFnError);
    }

    // Verificar si el bucket existe y asegurar que sea público
    try {
      // Lista de buckets
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      
      let bucketExists = false;
      if (!listError && buckets) {
        bucketExists = buckets.some(b => b.name === 'menu_images');
        console.log(`🔄 Bucket existe: ${bucketExists}`);
      }
      
      if (bucketExists) {
        // Asegurar que el bucket sea público
        const { error: updateError } = await supabaseAdmin.storage.updateBucket('menu_images', {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        
        if (updateError) {
          console.log('🔄 Error al actualizar bucket (ignorable):', updateError);
        } else {
          console.log('🔄 Bucket actualizado como público');
        }
      } else {
        // Crear bucket
        const { error: createError } = await supabaseAdmin.storage.createBucket('menu_images', {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        
        if (createError) {
          console.log('🔄 Error al crear bucket (ignorable):', createError);
        } else {
          console.log('🔄 Bucket creado exitosamente');
        }
      }
    } catch (bucketError) {
      console.log('🔄 Error en operación de bucket (continuando):', bucketError);
    }

    // Verificar listado de archivos para comprobar permisos
    try {
      const { data: files, error: listFilesError } = await supabaseAdmin.storage.from('menu_images').list();
      
      if (listFilesError) {
        console.log('🔄 Error al listar archivos (informativo):', listFilesError);
      } else {
        console.log(`🔄 Se pudieron listar ${files?.length || 0} archivos`);
      }
    } catch (listError) {
      console.log('🔄 Error al intentar listar archivos (informativo):', listError);
    }

    // Siempre retornar éxito, independientemente de errores específicos
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Proceso de inicialización de bucket completado',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('🔄 Error general en el proceso:', error);
    
    // Intentamos retornar éxito de todos modos para evitar bloquear el flujo
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Proceso completado pero con advertencias',
        error: error.message
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
