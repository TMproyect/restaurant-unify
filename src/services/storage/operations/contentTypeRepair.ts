
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from '../core/storageConfig';

/**
 * Intenta determinar el tipo de contenido basado en la extensión del archivo
 */
const getMimeTypeFromExtension = (filename: string): string | null => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon'
  };
  
  return mimeTypes[ext] || null;
};

/**
 * Verifica y repara el Content-Type de un objeto de Storage específico
 */
export const verifyAndRepairContentType = async (filePath: string): Promise<boolean> => {
  try {
    // Primero verificar si el archivo existe
    const { data: fileData, error: fileError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);
      
    if (fileError) {
      console.error('Error al verificar archivo:', fileError);
      return false;
    }
    
    // Obtener el tipo MIME basado en extensión
    const correctContentType = getMimeTypeFromExtension(filePath);
    if (!correctContentType) {
      console.warn(`No se pudo determinar el tipo MIME para ${filePath}`);
      return false;
    }
    
    // Descargar el archivo para volverlo a subir con el tipo MIME correcto
    if (fileData) {
      // Re-subir el archivo con el contentType correcto
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileData, {
          contentType: correctContentType,
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error al reparar Content-Type:', uploadError);
        return false;
      }
      
      console.log(`✅ Content-Type reparado para ${filePath}: ${correctContentType}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al reparar Content-Type:', error);
    return false;
  }
};

/**
 * Repara el Content-Type de múltiples archivos en un bucket
 */
export const bulkRepairContentTypes = async (prefix: string = 'menu/'): Promise<{ fixed: number, total: number }> => {
  try {
    let fixed = 0;
    let total = 0;
    
    // Listar archivos en el bucket con el prefijo dado
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(prefix, { sortBy: { column: 'name', order: 'asc' } });
      
    if (error) {
      console.error('Error al listar archivos:', error);
      return { fixed, total };
    }
    
    if (!files || files.length === 0) {
      console.log('No se encontraron archivos para reparar');
      return { fixed: 0, total: 0 };
    }
    
    total = files.length;
    console.log(`🔍 Encontrados ${total} archivos para revisar`);
    
    // Procesar cada archivo
    for (const file of files) {
      const fullPath = `${prefix}${file.name}`;
      const result = await verifyAndRepairContentType(fullPath);
      if (result) {
        fixed++;
      }
    }
    
    console.log(`✅ Reparación completada: ${fixed}/${total} archivos corregidos`);
    return { fixed, total };
  } catch (error) {
    console.error('Error en reparación masiva:', error);
    return { fixed: 0, total: 0 };
  }
};
