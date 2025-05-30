
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  debugInfo?: {
    fileValidated: boolean;
    uploadAttempted: boolean;
    urlGenerated: boolean;
  };
}

/**
 * Simplified image upload service - no complex validations
 */
export class EnhancedImageUploadService {
  private static readonly STORAGE_BUCKET = 'menu_images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  /**
   * Direct upload to Supabase without complex validations
   */
  static async uploadImage(file: File, fileName: string): Promise<EnhancedUploadResult> {
    const debugInfo = {
      fileValidated: false,
      uploadAttempted: false,
      urlGenerated: false
    };
    
    try {
      console.log('📤 SimpleUpload - Starting direct upload process');
      console.log('📤 SimpleUpload - File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // STEP 1: Basic file validation only
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Solo se permiten archivos de imagen',
          debugInfo
        };
      }
      
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'La imagen no debe superar los 5MB',
          debugInfo
        };
      }
      
      debugInfo.fileValidated = true;
      
      // STEP 2: Direct upload to Supabase
      const filePath = `menu/${fileName}`;
      console.log('📤 SimpleUpload - Upload path:', filePath);
      
      debugInfo.uploadAttempted = true;
      
      const { data, error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (error) {
        console.error('📤 SimpleUpload - Upload failed:', error);
        
        if (error.message.includes('Duplicate')) {
          return {
            success: false,
            error: 'Ya existe un archivo con este nombre',
            debugInfo
          };
        }
        
        return {
          success: false,
          error: `Error de subida: ${error.message}`,
          debugInfo
        };
      }
      
      if (!data?.path) {
        return {
          success: false,
          error: 'No se pudo obtener la ruta del archivo',
          debugInfo
        };
      }
      
      console.log('📤 SimpleUpload - ✅ Upload successful, path:', data.path);
      
      // STEP 3: Generate public URL
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(data.path);
      
      if (!urlData?.publicUrl) {
        return {
          success: false,
          error: 'Error generando URL pública',
          debugInfo
        };
      }
      
      debugInfo.urlGenerated = true;
      
      console.log('📤 SimpleUpload - ✅ Success! URL:', urlData.publicUrl);
      
      return {
        success: true,
        imageUrl: urlData.publicUrl,
        debugInfo
      };
      
    } catch (error) {
      console.error('📤 SimpleUpload - Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        debugInfo
      };
    }
  }
}
