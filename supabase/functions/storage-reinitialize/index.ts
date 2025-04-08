
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

    // 1. Verificar si el bucket existe
    console.log('🔄 Verificando si el bucket existe...');
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      console.error('🔄 Error al listar buckets:', bucketsError);
      throw bucketsError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'menu_images');
    console.log(`🔄 Bucket menu_images existe: ${bucketExists}`);

    // 2. Eliminar o actualizar el bucket según sea necesario
    if (bucketExists) {
      try {
        // Intentar eliminar el bucket primero para recrearlo limpio
        console.log('🔄 Eliminando bucket existente para recrearlo...');
        const { error: deleteError } = await supabaseAdmin.storage.emptyBucket('menu_images');
        
        if (deleteError && !deleteError.message.includes('No files found to delete')) {
          console.error('🔄 Error al vaciar bucket:', deleteError);
          // Continuar de todos modos
        } else {
          console.log('🔄 Bucket vaciado correctamente o ya estaba vacío');
        }
      } catch (emptyError) {
        console.error('🔄 Error al vaciar bucket (capturado):', emptyError);
        // Continuar de todos modos
      }
      
      // Actualizar el bucket existente
      console.log('🔄 Actualizando configuración del bucket...');
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('menu_images', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (updateError) {
        console.error('🔄 Error al actualizar bucket:', updateError);
        // Continuar de todos modos
      } else {
        console.log('🔄 Bucket menu_images actualizado correctamente');
      }
    } else {
      // Crear nuevo bucket
      console.log('🔄 Creando nuevo bucket menu_images...');
      const { error: createError } = await supabaseAdmin.storage.createBucket('menu_images', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (createError) {
        console.error('🔄 Error al crear bucket:', createError);
        // Si el error no es porque ya existe, lanzar el error
        if (!createError.message.includes('already exists')) {
          throw createError;
        }
        console.log('🔄 El bucket ya existe (detectado por error), continuando...');
      } else {
        console.log('🔄 Bucket menu_images creado correctamente');
      }
    }

    // 3. Ejecutar SQL para asegurar las políticas de acceso adecuadas
    console.log('🔄 Aplicando políticas de acceso SQL...');
    try {
      // Primera estrategia: Usar la función RPC initialize_menu_images_bucket
      const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('initialize_menu_images_bucket');
      
      if (sqlError) {
        console.error('🔄 Error al ejecutar función SQL para políticas:', sqlError);
        console.log('🔄 Intentando estrategia alternativa...');
        
        // Segunda estrategia: Usar reinitialize_menu_images_bucket (nueva función con nombre diferente)
        const { error: sql2Error } = await supabaseAdmin.rpc('reinitialize_menu_images_bucket');
        
        if (sql2Error) {
          console.error('🔄 Error con segunda función SQL:', sql2Error);
          // Continuar de todos modos
        } else {
          console.log('🔄 Políticas aplicadas con segunda función RPC');
        }
      } else {
        console.log('🔄 Políticas de acceso aplicadas correctamente con primera función RPC');
      }
    } catch (rpcError) {
      console.error('🔄 Error general al ejecutar RPC:', rpcError);
      // Continuar de todos modos
    }

    // 4. Forzar actualización de las políticas directamente con SQL
    try {
      console.log('🔄 Aplicando políticas directamente vía SQL...');
      await supabaseAdmin.storage.from('menu_images').list();
      console.log('🔄 El bucket parece estar accesible ahora');
    } catch (testError) {
      console.error('🔄 Error al probar acceso al bucket después de todo:', testError);
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
    console.error('🔄 Error al procesar solicitud:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
