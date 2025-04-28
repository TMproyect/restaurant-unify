
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  getIsInitializing, 
  setIsInitializing, 
  getInitializationPromise, 
  setInitializationPromise,
  getLastInitAttempt,
  setLastInitAttempt,
  MIN_RETRY_INTERVAL
} from './storageConfig';
import { migrateAllBase64Images } from '../operations/imageMigration';

/**
 * Inicializa el almacenamiento para asegurar que el bucket exista
 */
export const initializeStorage = async (): Promise<boolean> => {
  // Evitar múltiples llamadas en un corto periodo de tiempo
  const now = Date.now();
  if (now - getLastInitAttempt() < MIN_RETRY_INTERVAL) {
    console.log('📦 Ignorando intento de inicialización, demasiado pronto desde el último intento');
    const promise = getInitializationPromise();
    if (promise) return promise;
    return false;
  }
  
  // Update last attempt time
  setLastInitAttempt(now);
  
  // Si ya hay una inicialización en progreso, devolver la promesa existente
  if (getIsInitializing() && getInitializationPromise()) {
    console.log('📦 Ya hay una inicialización en progreso, devolviendo promesa existente');
    return getInitializationPromise()!;
  }
  
  // Iniciar nueva inicialización
  setIsInitializing(true);
  console.log('📦 Iniciando nueva inicialización de almacenamiento');
  
  const promise = new Promise<boolean>(async (resolve) => {
    try {
      console.log('📦 Invocando edge function storage-reinitialize');
      
      // Verificar si el bucket existe llamando a la Edge Function
      const { data, error } = await supabase.functions.invoke('storage-reinitialize');
      
      if (error) {
        console.error('📦 Error al inicializar almacenamiento:', error);
        toast.error('Error al inicializar almacenamiento de imágenes');
        // No fallamos inmediatamente, seguimos intentando migrar imágenes
      } else {
        console.log('📦 Respuesta de edge function:', data);
      }
      
      // Intentar migrar imágenes Base64 automáticamente - incluso si hubo error en la inicialización
      try {
        console.log('📦 Iniciando migración de imágenes Base64');
        const migrated = await migrateAllBase64Images();
        if (migrated) {
          console.log('📦 Imágenes migradas correctamente');
        } else {
          console.log('📦 No se migraron imágenes o proceso incompleto');
        }
      } catch (migrationError) {
        console.error('📦 Error en migración automática:', migrationError);
        // No fallamos el proceso completo si la migración falla
      }
      
      // Verificar si el bucket está correctamente configurado
      try {
        const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('menu_images');
        if (bucketError) {
          console.error('📦 Error verificando bucket:', bucketError);
        } else {
          console.log('📦 Estado del bucket despues de inicialización:', bucketInfo);
        }
      } catch (verifyError) {
        console.error('📦 Error verificando bucket:', verifyError);
      }
      
      setIsInitializing(false);
      setInitializationPromise(null);
      
      // Verificar si hay alguna evidencia de éxito para no retornar falsos positivos
      if (!error) {
        console.log('📦 Inicialización completada correctamente');
        resolve(true);
      } else {
        console.error('📦 La inicialización completó con errores');
        resolve(false);
      }
    } catch (error) {
      console.error('Error crítico inicializando almacenamiento:', error);
      setIsInitializing(false);
      setInitializationPromise(null);
      resolve(false);
    }
  });
  
  setInitializationPromise(promise);
  return promise;
};
