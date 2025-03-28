
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
      console.error('Missing environment variables')
      throw new Error('Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the request body
    const requestBody = await req.json()
    console.log('Received request body:', JSON.stringify(requestBody))
    
    const { email, password, name, role, action } = requestBody

    // If we're updating a user role
    if (action === 'update_role' && requestBody.userId) {
      console.log(`Updating user ${requestBody.userId} role to ${role}`)
      
      if (!requestBody.userId || !role) {
        throw new Error('Missing required fields: userId and role are required for role updates')
      }
      
      // Use service role to bypass RLS policies
      const { error: profileError, data: profileData } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', requestBody.userId)
        .select()
      
      if (profileError) {
        console.error('Error updating role:', profileError)
        throw profileError
      }
      
      // Get the user's email for the response
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        requestBody.userId
      )
      
      let userEmail = ''
      if (!userError && userData && userData.user) {
        userEmail = userData.user.email || ''
        console.log(`Retrieved email for user ${requestBody.userId}: ${userEmail}`)
      } else {
        console.log(`Could not retrieve email for user ${requestBody.userId}`)
      }
      
      console.log('Role updated successfully:', profileData)
      
      // Return the profile data with the email
      const responseData = profileData && profileData.length > 0
        ? { ...profileData[0], email: userEmail }
        : null
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'User role updated successfully',
          data: responseData
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      )
    }

    // If we're updating a user's name
    if (action === 'update_name' && requestBody.userId && requestBody.name) {
      console.log(`Updating user ${requestBody.userId} name to ${requestBody.name}`)
      
      // Use service role to bypass RLS policies
      const { error: profileError, data: profileData } = await supabase
        .from('profiles')
        .update({ name: requestBody.name })
        .eq('id', requestBody.userId)
        .select()
      
      if (profileError) {
        console.error('Error updating name:', profileError)
        throw profileError
      }
      
      // Get the user's email for the response
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        requestBody.userId
      )
      
      let userEmail = ''
      if (!userError && userData && userData.user) {
        userEmail = userData.user.email || ''
        console.log(`Retrieved email for user ${requestBody.userId}: ${userEmail}`)
      } else {
        console.log(`Could not retrieve email for user ${requestBody.userId}`)
      }
      
      console.log('Name updated successfully:', profileData)
      
      // Return the profile data with the email
      const responseData = profileData && profileData.length > 0
        ? { ...profileData[0], email: userEmail }
        : null
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'User name updated successfully',
          data: responseData
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      )
    }

    // If we're fetching user emails
    if (action === 'get_emails' && requestBody.userIds && Array.isArray(requestBody.userIds)) {
      console.log(`Fetching emails for ${requestBody.userIds.length} users`)
      
      const emailsMap = {}
      
      // Get emails for all requested users
      await Promise.all(requestBody.userIds.map(async (userId) => {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
        
        if (!userError && userData && userData.user) {
          emailsMap[userId] = userData.user.email || ''
          console.log(`Retrieved email for user ${userId}: ${userData.user.email}`)
        } else {
          emailsMap[userId] = ''
          console.log(`Could not retrieve email for user ${userId}`)
        }
      }))
      
      return new Response(
        JSON.stringify({ 
          success: true,
          data: emailsMap
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      )
    }
    
    // Handle user creation (original functionality)
    if (!email || !password || !name) {
      console.error('Missing required fields')
      throw new Error('Missing required fields: email, password, and name are required')
    }

    // Validate role
    const validRoles = ['admin', 'waiter', 'kitchen', 'delivery', 'manager']
    const safeRole = validRoles.includes(role) ? role : 'waiter'

    console.log(`Creating user with email: ${email}, name: ${name}, role: ${safeRole}`)

    // Check if user already exists
    const { data: existingUsers, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1)
    
    if (lookupError) {
      console.error('Error looking up existing user:', lookupError)
      // Continue anyway since the email might be unique in auth but not in profiles
    } else if (existingUsers && existingUsers.length > 0) {
      console.log('User with this email already exists in profiles table')
      // Continue anyway, will update the profile if needed
    }

    // Create user with admin API
    console.log('Calling auth.admin.createUser API')
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
      console.error('User creation returned no user data')
      throw new Error('User creation failed, no user returned')
    }

    console.log(`User created with ID: ${userData.user.id}`)

    // Create or update profile in profiles table
    console.log('Creating/updating profile in profiles table')
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
    } else {
      console.log('Profile created/updated successfully')
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        user: { ...userData.user, name, role: safeRole },
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
