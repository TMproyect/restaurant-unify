
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'inventory' | 'table' | 'system';
  read: boolean;
  link?: string;
  action_text?: string;
  created_at: string;
}

export async function getNotifications() {
  console.log("Fetching notifications from Supabase");
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }

    console.log("Fetched notifications:", data);
    return data || [];
  } catch (error) {
    console.error("Exception fetching notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  console.log(`Marking notification ${id} as read`);
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }

    console.log("Notification marked as read:", data);
    return data?.[0];
  } catch (error) {
    console.error("Exception marking notification as read:", error);
    return null;
  }
}

export async function markAllNotificationsAsRead() {
  console.log("Marking all notifications as read");
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
      .select();

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }

    console.log("All notifications marked as read:", data);
    return data || [];
  } catch (error) {
    console.error("Exception marking all notifications as read:", error);
    return [];
  }
}

export async function getUnreadNotificationsCount() {
  console.log("Getting unread notifications count");
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error("Error getting unread notifications count:", error);
      throw error;
    }

    console.log("Unread notifications count:", count);
    return count || 0;
  } catch (error) {
    console.error("Exception getting unread notifications count:", error);
    return 0;
  }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
  console.log("Creating notification:", notification);
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        read: false
      })
      .select();

    if (error) {
      console.error("Error creating notification:", error);
      throw error;
    }

    console.log("Notification created:", data);
    return data?.[0];
  } catch (error) {
    console.error("Exception creating notification:", error);
    return null;
  }
}
