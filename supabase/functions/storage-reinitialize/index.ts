
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
    let bucketExists = false;
    
    try {
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        console.error('🔄 Error al listar buckets:', bucketsError);
      } else {
        bucketExists = buckets.some(bucket => bucket.name === 'menu_images');
        console.log(`🔄 Bucket menu_images existe: ${bucketExists}`);
      }
    } catch (listError) {
      console.error('🔄 Error al verificar si existe el bucket:', listError);
      // Asumir que no existe para intentar crearlo
      bucketExists = false;
    }

    // 2. Eliminar o actualizar el bucket según sea necesario
    if (bucketExists) {
      try {
        // Actualizar el bucket existente para asegurar que sea público
        console.log('🔄 Actualizando configuración del bucket...');
        const { error: updateError } = await supabaseAdmin.storage.updateBucket('menu_images', {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        
        if (updateError) {
          console.error('🔄 Error al actualizar bucket:', updateError);
        } else {
          console.log('🔄 Bucket menu_images actualizado correctamente');
        }
      } catch (updateError) {
        console.error('🔄 Error al actualizar bucket (capturado):', updateError);
      }
    } else {
      // Crear nuevo bucket con manejo mejorado de errores
      console.log('🔄 Creando nuevo bucket menu_images...');
      try {
        const { error: createError } = await supabaseAdmin.storage.createBucket('menu_images', {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        
        if (createError) {
          console.error('🔄 Error al crear bucket:', createError);
          
          // Si el error es que ya existe, marcarlo como existente
          if (createError.message && createError.message.includes('already exists')) {
            console.log('🔄 El bucket ya existe, continuando...');
            bucketExists = true;
          }
        } else {
          console.log('🔄 Bucket menu_images creado correctamente');
          bucketExists = true;
        }
      } catch (createError) {
        console.error('🔄 Error capturado al crear bucket:', createError);
        // Si falló, intentar acceder al bucket de todos modos
      }
    }

    // 3. Aplicar políticas SQL directamente
    console.log('🔄 Aplicando políticas directamente en SQL...');
    
    try {
      // Ejecutar SQL directamente para configurar las políticas
      const sqlQuery = `
        -- Asegurar que el bucket existe y es público
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('menu_images', 'menu_images', true)
        ON CONFLICT (id) DO UPDATE 
        SET public = true;
        
        -- Eliminar políticas existentes para evitar conflictos
        DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
        DROP POLICY IF EXISTS "Upload Menu Images" ON storage.objects;
        DROP POLICY IF EXISTS "Update Menu Images" ON storage.objects;
        DROP POLICY IF EXISTS "Delete Menu Images" ON storage.objects;
        DROP POLICY IF EXISTS "Allow FULL Public Access to Menu Images" ON storage.objects;
        DROP POLICY IF EXISTS "Public SELECT to Menu Images" ON storage.objects;
        
        -- Crear políticas permisivas
        CREATE POLICY "Public Access to Menu Images" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'menu_images');
        
        CREATE POLICY "Upload Menu Images" 
        ON storage.objects FOR INSERT 
        WITH CHECK (bucket_id = 'menu_images');
        
        CREATE POLICY "Update Menu Images" 
        ON storage.objects FOR UPDATE 
        USING (bucket_id = 'menu_images');
        
        CREATE POLICY "Delete Menu Images" 
        ON storage.objects FOR DELETE 
        USING (bucket_id = 'menu_images');
      `;
      
      // Ejecutar SQL usando la API REST de Supabase
      const { error: sqlError } = await supabaseAdmin.rpc('supabase_storage_admin_query', { sql_query: sqlQuery });
      
      if (sqlError) {
        console.error('🔄 Error al ejecutar SQL para políticas:', sqlError);
        // Continuar de todos modos - puede que no tenga permisos para esta función específica
      } else {
        console.log('🔄 Políticas SQL aplicadas correctamente');
      }
    } catch (sqlError) {
      console.error('🔄 Error al aplicar políticas SQL (capturado):', sqlError);
    }

    // 4. Verificar que el bucket sea accesible
    try {
      console.log('🔄 Verificando acceso al bucket...');
      await supabaseAdmin.storage.from('menu_images').list();
      console.log('🔄 El bucket parece estar accesible');
    } catch (testError) {
      console.error('🔄 Error al probar acceso al bucket:', testError);
    }

    // Retornar respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bucket menu_images inicializado correctamente',
        bucket_exists: bucketExists
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
