
import { toast } from 'sonner';

// Tipos MIME permitidos para imágenes
const ALLOWED_MIME_TYPES: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Tamaño máximo de archivo: 5MB
const MAX_FILE_SIZE_BYTES: number = 5 * 1024 * 1024;

/**
 * Validación estricta e inmediata del File Object
 * Solo File objects que cumplan con todos los criterios continuarán en el flujo
 */
export function validateSelectedFile(file: any): File | null {
  console.log('🔍 Iniciando validación estricta de archivo:', {
    file,
    isFile: file instanceof File,
    type: file?.type,
    size: file?.size,
    name: file?.name
  });

  // 1. Verificar si es realmente un File object
  if (!(file instanceof File)) {
    console.error('❌ Error de validación (upload): El objeto proporcionado no es un File.', file);
    toast.error('El archivo seleccionado no es válido. Por favor, intente de nuevo.');
    return null;
  }

  // 2. Verificar el tipo MIME
  const fileTypeLower = file.type?.toLowerCase();
  if (!fileTypeLower || !ALLOWED_MIME_TYPES.includes(fileTypeLower)) {
    console.error(
      `❌ Error de validación (upload): Tipo de archivo no permitido o ausente. Recibido: "${file.type}". Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
      file
    );
    toast.error(`Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_MIME_TYPES.join(', ')}.`);
    return null;
  }

  // 3. Verificar el tamaño del archivo
  if (file.size > MAX_FILE_SIZE_BYTES) {
    console.error(
      `❌ Error de validación (upload): El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE_BYTES / (1024*1024)}MB. Tamaño actual: ${file.size} bytes.`,
      file
    );
    toast.error(`El archivo es demasiado grande. El tamaño máximo es ${MAX_FILE_SIZE_BYTES / (1024*1024)}MB.`);
    return null;
  }

  console.log('✅ Validación de archivo exitosa:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  // Si todas las validaciones pasan, devolver el File object
  return file;
}

/**
 * Genera un nombre de archivo único preservando la extensión original
 */
export function generateUniqueFileName(originalName: string): string {
  // Extraer la extensión del nombre original
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalName.substring(lastDotIndex).toLowerCase() : '';
  
  // Generar nombre base único usando timestamp + aleatorio
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const uniqueBaseName = `${timestamp}_${random}`;
  
  const uniqueFileName = `${uniqueBaseName}${extension}`;
  
  console.log('🔄 Nombre de archivo generado:', {
    original: originalName,
    unique: uniqueFileName,
    extension
  });
  
  return uniqueFileName;
}
