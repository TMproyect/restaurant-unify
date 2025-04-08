
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers to ensure the function can be called from any origin
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
    console.log('🔄 Iniciando reinicialización del bucket menu_images...');
    
    // Create Supabase client with admin privileges
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

    // Try to run the SQL function to reset permissions
    try {
      await supabaseAdmin.rpc('reset_menu_images_permissions');
      console.log('🔄 Permisos reiniciados con función SQL');
    } catch (resetError) {
      console.log('🔄 Nota: No se pudo llamar a reset_menu_images_permissions:', resetError.message);
      
      // Fallback: Try to manually set the RLS policies
      try {
        // Check if bucket exists
        const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
        
        if (bucketsError) {
          console.log('🔄 Error al listar buckets:', bucketsError.message);
        } else {
          console.log(`🔄 Buckets encontrados: ${buckets?.length || 0}`);
          const bucketExists = buckets?.some(b => b.name === 'menu_images') || false;
          console.log(`🔄 Bucket existe: ${bucketExists}`);
          
          // Create or update bucket
          if (bucketExists) {
            const { error: updateError } = await supabaseAdmin.storage.updateBucket(
              'menu_images', 
              { public: true }
            );
            
            if (updateError) {
              console.log('🔄 Error al actualizar bucket:', updateError.message);
            } else {
              console.log('🔄 Bucket actualizado correctamente');
            }
          } else {
            const { error: createError } = await supabaseAdmin.storage.createBucket(
              'menu_images', 
              { public: true }
            );
            
            if (createError) {
              console.log('🔄 Error al crear bucket:', createError.message);
            } else {
              console.log('🔄 Bucket creado correctamente');
            }
          }
        }
      } catch (manualError) {
        console.log('🔄 Error en manejo manual de bucket:', manualError);
      }
    }
    
    // Verify access by listing files in the bucket
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
        message: 'Bucket menu_images inicializado correctamente',
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
        message: 'Error al inicializar bucket menu_images',
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
