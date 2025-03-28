
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user context
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: 'Not authenticated',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log("Creating seed data for user:", user.id);

    // Get profiles to send messages between them
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('*');

    if (!profiles || profiles.length < 1) {
      return new Response(
        JSON.stringify({
          error: 'No profiles found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Sample notification types
    const notificationTypes = ['order', 'inventory', 'table', 'system'];
    const notificationLinks = ['/orders', '/inventory', '/tables', '/settings'];

    // Create sample notifications
    const notifications = [];
    for (let i = 0; i < 10; i++) {
      const typeIndex = i % notificationTypes.length;
      const notification = {
        user_id: user.id,
        title: `Test Notification ${i+1}`,
        description: `This is a test notification of type ${notificationTypes[typeIndex]}`,
        type: notificationTypes[typeIndex],
        read: i < 3 ? false : true,
        link: notificationLinks[typeIndex],
        action_text: 'View'
      };
      notifications.push(notification);
    }

    // Add specific notifications for testing
    notifications.push({
      user_id: user.id,
      title: 'Inventario bajo',
      description: 'Algunos productos están por debajo del nivel mínimo',
      type: 'inventory',
      read: false,
      link: '/inventory',
      action_text: 'Ver inventario'
    });

    notifications.push({
      user_id: user.id,
      title: 'Nuevas reservas',
      description: '3 nuevas reservas para hoy',
      type: 'table',
      read: false,
      link: '/orders',
      action_text: 'Ver reservas'
    });

    notifications.push({
      user_id: user.id,
      title: 'Nuevo pedido en Mesa 3',
      description: 'La mesa 3 tiene un nuevo pedido',
      type: 'order',
      read: true,
      link: '/orders',
      action_text: 'Ver pedido'
    });

    // Insert notifications
    const { data: insertedNotifications, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notifications)
      .select();

    if (notificationError) {
      console.error("Error inserting notifications:", notificationError);
      throw notificationError;
    }

    // Create sample messages between users
    const messages = [];
    if (profiles.length > 1) {
      const otherUsers = profiles.filter(p => p.id !== user.id);
      
      for (const otherUser of otherUsers) {
        // Messages from other user to current user
        for (let i = 0; i < 3; i++) {
          messages.push({
            sender_id: otherUser.id,
            receiver_id: user.id,
            content: `Message ${i+1} from ${otherUser.name} to you`,
            read: i < 1 ? false : true
          });
        }
        
        // Messages from current user to other users
        for (let i = 0; i < 2; i++) {
          messages.push({
            sender_id: user.id,
            receiver_id: otherUser.id,
            content: `Message ${i+1} from you to ${otherUser.name}`,
            read: true
          });
        }
      }
    }

    // Insert messages if we have any
    let insertedMessages = null;
    let messageError = null;
    
    if (messages.length > 0) {
      const result = await supabaseClient
        .from('messages')
        .insert(messages)
        .select();
        
      insertedMessages = result.data;
      messageError = result.error;
      
      if (messageError) {
        console.error("Error inserting messages:", messageError);
        throw messageError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications: insertedNotifications,
        messages: insertedMessages,
        message: "Seed data created successfully",
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in seed-data function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
