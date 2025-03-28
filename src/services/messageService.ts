
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export async function getMessages() {
  console.log("Fetching messages from Supabase");
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }

    console.log("Fetched messages:", data);
    return data || [];
  } catch (error) {
    console.error("Exception fetching messages:", error);
    return [];
  }
}

export async function sendMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at' | 'read'>) {
  console.log("Sending message:", message);
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...message,
        read: false
      })
      .select();

    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }

    console.log("Message sent:", data);
    return data?.[0];
  } catch (error) {
    console.error("Exception sending message:", error);
    return null;
  }
}

export async function markMessageAsRead(id: string) {
  console.log(`Marking message ${id} as read`);
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }

    console.log("Message marked as read:", data);
    return data?.[0];
  } catch (error) {
    console.error("Exception marking message as read:", error);
    return null;
  }
}

export async function getUnreadMessagesCount(userId: string) {
  console.log("Getting unread messages count for user:", userId);
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) {
      console.error("Error getting unread messages count:", error);
      throw error;
    }

    console.log("Unread messages count:", count);
    return count || 0;
  } catch (error) {
    console.error("Exception getting unread messages count:", error);
    return 0;
  }
}
