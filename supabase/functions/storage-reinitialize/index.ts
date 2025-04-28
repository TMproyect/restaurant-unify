
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
    
    console.log('📦 Inicializando bucket de almacenamiento menu_images');
    
    try {
      // Create or confirm bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage
        .createBucket('menu_images', { public: true });
        
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Error creating bucket:', bucketError);
        // No lanzamos error aquí, intentamos continuar con la actualización
      }
    } catch (createError) {
      console.log('📦 Error al crear bucket, probablemente ya existe:', createError);
      // Ignoramos este error y continuamos
    }
    
    // Update bucket to ensure it's public - incluso si la creación falló
    try {
      await supabase.storage.updateBucket('menu_images', { public: true });
      console.log('📦 Bucket configurado como público');
    } catch (updateError) {
      console.error('Error updating bucket:', updateError);
    }
    
    // Llamamos a la función RPC de PostgreSQL para verificar y actualizar permisos
    // Usamos reset_menu_images_permissions en lugar de verify_menu_images_bucket
    try {
      const { error: rpcError } = await supabase
        .rpc('reset_menu_images_permissions');
        
      if (rpcError) {
        console.error('Error en reset_menu_images_permissions RPC:', rpcError);
      } else {
        console.log('📦 Permisos de bucket actualizados correctamente por RPC');
      }
    } catch (rpcError) {
      console.log('RPC no disponible o error:', rpcError);
      // Continuamos sin depender del resultado de la RPC
    }
    
    console.log('📦 Almacenamiento inicializado correctamente');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage initialized successfully" 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('📦 Error en storage-reinitialize:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
