
import { supabase } from '@/integrations/supabase/client';
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
    return getInitializationPromise()!;
  }
  
  // Iniciar nueva inicialización
  setIsInitializing(true);
  
  const promise = new Promise<boolean>(async (resolve) => {
    try {
      console.log('📦 Iniciando inicialización de almacenamiento');
      
      // Verificar si el bucket existe llamando a la Edge Function
      const { error } = await supabase.functions.invoke('storage-reinitialize');
      
      if (error) {
        console.error('📦 Error al inicializar almacenamiento:', error);
        // No fallamos inmediatamente, seguimos intentando migrar imágenes
      } else {
        console.log('📦 Almacenamiento inicializado correctamente');
      }
      
      // Intentar migrar imágenes Base64 automáticamente - incluso si hubo error en la inicialización
      try {
        const migrated = await migrateAllBase64Images();
        if (migrated) {
          console.log('📦 Imágenes migradas correctamente');
        }
      } catch (migrationError) {
        console.error('📦 Error en migración automática:', migrationError);
        // No fallamos el proceso completo si la migración falla
      }
      
      setIsInitializing(false);
      // Consideramos exitosa la inicialización incluso si solo uno de los pasos funciona
      resolve(true);
    } catch (error) {
      console.error('Error inicializando almacenamiento:', error);
      setIsInitializing(false);
      resolve(false);
    }
  });
  
  setInitializationPromise(promise);
  return promise;
};
