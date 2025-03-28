
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Set up CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the request body
    const { email, password, name, role } = await req.json()

    if (!email || !password || !name) {
      throw new Error('Missing required fields: email, password, and name are required')
    }

    // Validate role
    const validRoles = ['admin', 'waiter', 'kitchen', 'delivery', 'manager']
    const safeRole = validRoles.includes(role) ? role : 'waiter'

    console.log(`Creating user with email: ${email}, name: ${name}, role: ${safeRole}`)

    // Create user with admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: safeRole }
    })

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    if (!userData.user) {
      throw new Error('User creation failed, no user returned')
    }

    console.log(`User created with ID: ${userData.user.id}`)

    // Create or update profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        name,
        role: safeRole
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't throw error here, as user is already created
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        user: userData.user,
        message: 'User created successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in edge function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while creating the user'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})
