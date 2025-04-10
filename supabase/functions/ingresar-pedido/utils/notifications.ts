
// Utilidad para crear notificaciones

/**
 * Crea una notificación en el sistema
 * @param supabase Cliente de Supabase
 * @param notificationData Datos de la notificación
 * @returns Resultado de la operación
 */
export async function createNotification(supabase: any, notificationData: {
  title: string;
  description: string;
  type: string;
  user_id: string | null;
  link?: string;
  action_text?: string;
}) {
  try {
    console.log("Creando notificación con datos:", JSON.stringify(notificationData));
    
    const { error } = await supabase
      .from('notifications')
      .insert(notificationData);
    
    if (error) {
      console.error("Error al crear notificación:", error);
      return { error };
    }
    
    console.log("Notificación creada exitosamente");
    return { success: true };
  } catch (error) {
    console.error("Error inesperado al crear notificación:", error);
    return { error };
  }
}
