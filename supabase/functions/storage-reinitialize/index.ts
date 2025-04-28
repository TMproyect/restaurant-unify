
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
    
    // Ensure bucket exists with proper error handling
    try {
      // Create or confirm bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage
        .createBucket('menu_images', { public: true });
        
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Error creating bucket:', bucketError);
      } else {
        console.log('📦 Bucket creado o ya existente');
      }
    } catch (createError) {
      console.log('📦 Error al crear bucket, probablemente ya existe:', createError);
      // Continue despite this error
    }
    
    // Update bucket to ensure it's public
    try {
      const { error: updateError } = await supabase.storage
        .updateBucket('menu_images', { public: true });
      
      if (updateError) {
        console.error('Error updating bucket:', updateError);
      } else {
        console.log('📦 Bucket configurado como público');
      }
    } catch (updateError) {
      console.error('Error updating bucket:', updateError);
    }
    
    // Call the reset_menu_images_permissions RPC function
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('reset_menu_images_permissions');
        
      if (rpcError) {
        console.error('Error en reset_menu_images_permissions RPC:', rpcError);
        // Don't throw, try to continue
      } else {
        console.log('📦 Permisos de bucket actualizados correctamente por RPC');
      }
    } catch (rpcError) {
      console.error('Error grave en RPC:', rpcError);
      // Continue despite error
    }
    
    // Verify bucket is public by fetching its metadata
    try {
      const { data: bucketInfo, error: getBucketError } = await supabase
        .storage
        .getBucket('menu_images');
      
      if (getBucketError) {
        console.error('Error verificando bucket:', getBucketError);
      } else {
        console.log('📦 Estado del bucket:', JSON.stringify(bucketInfo));
      }
    } catch (verifyError) {
      console.error('Error verificando bucket:', verifyError);
    }
    
    console.log('📦 Almacenamiento inicializado correctamente');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage initialized successfully",
        time: new Date().toISOString()
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
        error: error instanceof Error ? error.message : String(error),
        time: new Date().toISOString() 
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
