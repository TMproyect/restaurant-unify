import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { corsHeaders } from '../_shared/cors.ts';
import { getEnv } from '../_shared/env.ts';

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables with enhanced error handling
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv([
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]);

    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { email, password, name, role } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating user with email: ${email}, name: ${name}, role: ${role}`);

    // Create user in auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: { name, role },
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure we have a user
    if (!userData?.user) {
      throw new Error('User created but no user data returned');
    }

    const userId = userData.user.id;
    console.log(`User created with ID: ${userId}`);

    // Create profile in public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: userId,
          name,
          role,
        },
      ]);

    // If profile creation fails, try to delete the user to maintain consistency
    if (profileError) {
      console.error('Error creating profile:', profileError);
      
      // Attempt to delete the user since profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success response with user data
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: userData.user.email,
          name,
          role,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-user-with-profile function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
