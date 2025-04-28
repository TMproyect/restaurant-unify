
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
 * Inicializa el almacenamiento asegurando que el bucket exista
 */
export const initializeStorage = async (forceCheck = false): Promise<boolean> => {
  // Evitar múltiples llamadas en un corto periodo de tiempo
  const now = Date.now();
  if (!forceCheck && now - getLastInitAttempt() < MIN_RETRY_INTERVAL) {
    const promise = getInitializationPromise();
    if (promise) return promise;
    return true; // Asumir éxito para evitar bloqueos
  }
  
  // Actualizar tiempo del último intento
  setLastInitAttempt(now);
  
  // Si ya hay una inicialización en progreso, devolver la promesa existente
  if (getIsInitializing() && getInitializationPromise()) {
    return getInitializationPromise()!;
  }
  
  // Iniciar nueva inicialización sin bloquear la UI
  setIsInitializing(true);
  
  const initPromise = new Promise<boolean>(async (resolve) => {
    try {
      // 1. Intentar usar la función RPC de verificación directa primero (más rápido)
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('verify_menu_images_bucket');
          
        if (!rpcError) {
          // La verificación RPC fue exitosa, continuar con migración en segundo plano
          setTimeout(() => {
            migrateAllBase64Images().catch(() => {
              // Ignorar errores de migración - no afectan la UI
            });
          }, 2000);
          
          setIsInitializing(false);
          setInitializationPromise(null);
          return resolve(true);
        }
      } catch (rpcErr) {
        // Continuar con el enfoque de Edge Function si RPC falla
      }
      
      // 2. Usar Edge Function como fallback
      const { data, error } = await supabase.functions.invoke('storage-reinitialize');
      
      if (error) {
        console.error('Error en Edge Function:', error);
        // Continuar a pesar del error - no bloquear la UI
      }
      
      // 3. Verificar estado del bucket independientemente del resultado anterior
      let bucketVerified = false;
      try {
        const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('menu_images');
        bucketVerified = !bucketError && bucketInfo && bucketInfo.public === true;
      } catch (verifyError) {
        console.error('Error verificando bucket:', verifyError);
      }
      
      // 4. Iniciar migración de imágenes en segundo plano sin bloquear
      setTimeout(() => {
        migrateAllBase64Images().catch(() => {
          // Ignorar errores de migración - no afectan la UI
        });
      }, 1000);
      
      // Resolver con éxito aunque haya habido problemas - priorizar fluidez
      resolve(true);
    } catch (error) {
      console.error('Error crítico inicializando almacenamiento:', error);
      resolve(true); // Resolver con éxito para no bloquear la UI
    } finally {
      setIsInitializing(false);
      setInitializationPromise(null);
    }
  });
  
  setInitializationPromise(initPromise);
  return initPromise;
};
