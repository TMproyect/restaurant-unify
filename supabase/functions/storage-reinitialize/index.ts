
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Primero verificar que la función RPC existe
    let rpcExists = false;
    try {
      const { data: rpcCheck, error: rpcCheckError } = await supabase
        .rpc('verify_menu_images_bucket');
        
      rpcExists = !rpcCheckError;
    } catch (rpcCheckError) {
      console.log('Función RPC no disponible, usando enfoque directo');
    }
    
    if (rpcExists) {
      // Usar la función RPC si existe
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('verify_menu_images_bucket');
        
      if (rpcError) {
        console.error('Error en RPC verify_menu_images_bucket:', rpcError);
        // Continuar con enfoque directo si RPC falla
      } else {
        console.log('📦 Verificación RPC exitosa');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Storage initialized via RPC",
            method: "rpc",
            time: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Enfoque directo si RPC no está disponible o falló
    
    // 1. Verificar y crear/actualizar el bucket
    let bucketCreated = false;
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage
        .createBucket('menu_images', { public: true });
        
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Error creating bucket:', bucketError);
      } else {
        bucketCreated = true;
      }
    } catch (createError) {
      console.log('Error al crear bucket:', createError);
      // Intentar actualizar si no se pudo crear
    }
    
    // 2. Actualizar el bucket para asegurarnos que es público
    try {
      const { error: updateError } = await supabase.storage
        .updateBucket('menu_images', { public: true });
      
      if (updateError) {
        console.error('Error updating bucket:', updateError);
      }
    } catch (updateError) {
      console.error('Error updating bucket:', updateError);
    }
    
    // 3. Verificar que el bucket existe y es público
    let bucketExists = false;
    let isPublic = false;
    try {
      const { data: bucketInfo, error: getBucketError } = await supabase
        .storage
        .getBucket('menu_images');
      
      if (getBucketError) {
        console.error('Error verificando bucket:', getBucketError);
      } else {
        bucketExists = true;
        isPublic = bucketInfo.public === true;
      }
    } catch (verifyError) {
      console.error('Error verificando bucket:', verifyError);
    }
    
    // 4. Verificar el tipo MIME de algunos objetos para diagnóstico
    const mimeTypeCheck = [];
    try {
      const { data: objects, error: objectsError } = await supabase.storage
        .from('menu_images')
        .list('menu', { limit: 5 });
        
      if (!objectsError && objects && objects.length > 0) {
        for (const obj of objects.slice(0, 3)) {
          try {
            const { data: metadata } = await supabase.storage
              .from('menu_images')
              .getPublicUrl(`menu/${obj.name}`);
              
            // Intentar obtener info de MIME type
            const headCheck = await fetch(metadata.publicUrl, { method: 'HEAD' })
              .catch(e => null);
            
            const contentType = headCheck?.headers?.get('content-type') || 'desconocido';
            mimeTypeCheck.push({ name: obj.name, contentType });
          } catch (e) {
            // Ignorar errores individuales
          }
        }
      }
    } catch (metadataError) {
      // Ignorar errores de metadata
    }
    
    return new Response(
      JSON.stringify({ 
        success: bucketExists && isPublic,
        message: bucketExists 
          ? (isPublic ? "Storage bucket exists and is public" : "Storage bucket exists but is not public")
          : "Failed to verify storage bucket",
        diagnostics: {
          bucketCreated,
          bucketExists,
          isPublic,
          mimeTypeCheck: mimeTypeCheck.length > 0 ? mimeTypeCheck : undefined
        },
        time: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en storage-reinitialize:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        time: new Date().toISOString() 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
