
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET, getIsInitializing, setIsInitializing, setInitializationPromise, getInitializationPromise, getLastInitAttempt, setLastInitAttempt, MIN_RETRY_INTERVAL } from './storageConfig';

/**
 * Inicializa el almacenamiento en Supabase
 * Verifica que el bucket exista y sea público
 */
export const initializeStorage = async (): Promise<boolean> => {
  // Evitar múltiples inicializaciones simultáneas
  if (getIsInitializing()) {
    const existingPromise = getInitializationPromise();
    if (existingPromise) {
      return existingPromise;
    }
  }
  
  // Evitar reintentos demasiado frecuentes
  const now = Date.now();
  const lastAttempt = getLastInitAttempt();
  if (now - lastAttempt < MIN_RETRY_INTERVAL) {
    console.log('📦 Ignorando inicialización reciente, espera un momento');
    return true; // Asumir éxito si fue muy reciente
  }
  
  setLastInitAttempt(now);
  setIsInitializing(true);
  
  const initPromise = new Promise<boolean>(async (resolve) => {
    try {
      console.log('📦 Inicializando almacenamiento...');
      
      // Intentar acceder directamente primero (más rápido)
      try {
        const { data: buckets, error } = await supabase.storage
          .getBucket(STORAGE_BUCKET);
          
        if (!error && buckets) {
          console.log('📦 Bucket encontrado y accesible');
          setIsInitializing(false);
          return resolve(true);
        }
      } catch (directError) {
        // Solo registrar, no es crítico
        console.log('📦 Error en acceso directo al bucket, intentando reinicialización completa');
      }
      
      // Utilizar la función Edge para reinicializar con permisos elevados
      try {
        const response = await supabase.functions
          .invoke('storage-reinitialize', {});
          
        if (response.error) {
          throw new Error(`Error en Edge Function: ${response.error.message}`);
        }
        
        console.log('📦 Almacenamiento inicializado correctamente vía Edge Function');
        setIsInitializing(false);
        return resolve(true);
      } catch (fnError) {
        console.error('📦 Error al invocar Edge Function:', fnError);
        
        // Plan B: Intentar crear el bucket directamente (podría fallar por permisos)
        try {
          await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
          console.log('📦 Bucket creado directamente');
        } catch (createError: any) {
          // Ignorar error si el bucket ya existe
          if (!createError.message?.includes('already exists')) {
            console.log('📦 Error al crear bucket:', createError);
          } else {
            console.log('📦 Bucket ya existe');
          }
        }
      }
      
      setIsInitializing(false);
      return resolve(true);
    } catch (finalError) {
      console.error('📦 Error crítico en inicialización:', finalError);
      setIsInitializing(false);
      return resolve(false);
    }
  });
  
  setInitializationPromise(initPromise);
  return initPromise;
};
