
import { toast } from 'sonner';

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an image file for type and size constraints
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  console.log('🔍 ImageValidation - Validating file:', {
    name: file.name,
    type: file.type,
    size: file.size,
    constructor: file.constructor.name
  });

  if (!file) {
    console.error('🔍 ImageValidation - No file provided');
    return { isValid: false, error: 'No se proporcionó archivo' };
  }

  // Validate file type
  if (!file.type.match('image.*')) {
    console.error('🔍 ImageValidation - Invalid file type:', file.type);
    toast.error('Solo se permiten archivos de imagen');
    return { isValid: false, error: 'Tipo de archivo inválido' };
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    console.error('🔍 ImageValidation - File too large:', file.size);
    toast.error('La imagen no debe superar los 5MB');
    return { isValid: false, error: 'Archivo demasiado grande' };
  }

  console.log('🔍 ImageValidation - ✅ File validation passed');
  return { isValid: true };
};

/**
 * Creates a preview URL for an image file
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('🔍 ImageValidation - Preview created, length:', result?.length);
      resolve(result);
    };
    
    reader.onerror = (e) => {
      console.error('🔍 ImageValidation - Error creating preview:', e);
      reject(new Error('Error al crear vista previa'));
    };
    
    reader.readAsDataURL(file);
  });
};
