
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BucketValidationService } from '../core/bucketValidation';

export interface EnhancedUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  debugInfo?: {
    bucketValid: boolean;
    fileValidated: boolean;
    uploadAttempted: boolean;
    urlGenerated: boolean;
  };
}

/**
 * Enhanced image upload service with comprehensive validation and logging
 */
export class EnhancedImageUploadService {
  private static readonly STORAGE_BUCKET = 'menu_images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  /**
   * Uploads an image with comprehensive validation and error handling
   */
  static async uploadImage(file: File, fileName: string): Promise<EnhancedUploadResult> {
    const debugInfo = {
      bucketValid: false,
      fileValidated: false,
      uploadAttempted: false,
      urlGenerated: false
    };
    
    try {
      console.log('📤 EnhancedUpload - Starting comprehensive upload process');
      console.log('📤 EnhancedUpload - File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        constructor: file.constructor.name
      });
      
      // STEP 1: Validate file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        return {
          success: false,
          error: fileValidation.error,
          debugInfo
        };
      }
      debugInfo.fileValidated = true;
      
      // STEP 2: Validate bucket
      console.log('📤 EnhancedUpload - Validating storage bucket...');
      const bucketValid = await BucketValidationService.validateBucket();
      debugInfo.bucketValid = bucketValid;
      
      if (!bucketValid) {
        console.error('📤 EnhancedUpload - Bucket validation failed');
        BucketValidationService.showBucketError();
        return {
          success: false,
          error: 'Storage bucket not configured correctly',
          debugInfo
        };
      }
      
      // STEP 3: Prepare upload path
      const filePath = `menu/${fileName}`;
      console.log('📤 EnhancedUpload - Upload path:', filePath);
      
      // STEP 4: Perform upload with explicit content type
      console.log('📤 EnhancedUpload - Starting upload to Supabase...');
      debugInfo.uploadAttempted = true;
      
      const { data, error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type, // Explicitly set content type
          duplex: 'half' // Required for some browsers
        });
      
      if (error) {
        console.error('📤 EnhancedUpload - Upload failed:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Duplicate')) {
          return {
            success: false,
            error: 'Ya existe un archivo con este nombre',
            debugInfo
          };
        } else if (error.message.includes('size')) {
          return {
            success: false,
            error: 'El archivo es demasiado grande',
            debugInfo
          };
        } else {
          return {
            success: false,
            error: `Error de subida: ${error.message}`,
            debugInfo
          };
        }
      }
      
      if (!data?.path) {
        console.error('📤 EnhancedUpload - No path returned:', data);
        return {
          success: false,
          error: 'No se pudo obtener la ruta del archivo',
          debugInfo
        };
      }
      
      console.log('📤 EnhancedUpload - ✅ Upload successful, path:', data.path);
      
      // STEP 5: Generate public URL
      console.log('📤 EnhancedUpload - Generating public URL...');
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(data.path);
      
      if (!urlData?.publicUrl) {
        console.error('📤 EnhancedUpload - Failed to generate public URL');
        return {
          success: false,
          error: 'Error generando URL pública',
          debugInfo
        };
      }
      
      debugInfo.urlGenerated = true;
      
      console.log('📤 EnhancedUpload - ✅ Public URL generated:', urlData.publicUrl);
      
      // STEP 6: Quick URL verification (non-blocking)
      this.verifyUrlAsync(urlData.publicUrl);
      
      return {
        success: true,
        imageUrl: urlData.publicUrl,
        debugInfo
      };
      
    } catch (error) {
      console.error('📤 EnhancedUpload - Exception during upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        debugInfo
      };
    }
  }
  
  /**
   * Validates file before upload
   */
  private static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check if it's actually a File object
    if (!(file instanceof File)) {
      console.error('📤 EnhancedUpload - Invalid file object');
      return { isValid: false, error: 'Objeto de archivo inválido' };
    }
    
    // Check file type
    if (!file.type || !file.type.startsWith('image/')) {
      console.error('📤 EnhancedUpload - Invalid file type:', file.type);
      return { isValid: false, error: 'Solo se permiten archivos de imagen' };
    }
    
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      console.error('📤 EnhancedUpload - File too large:', file.size);
      return { isValid: false, error: 'La imagen no debe superar los 5MB' };
    }
    
    // Check file name
    if (!file.name || file.name.length === 0) {
      console.error('📤 EnhancedUpload - Invalid file name');
      return { isValid: false, error: 'Nombre de archivo inválido' };
    }
    
    return { isValid: true };
  }
  
  /**
   * Verifies URL accessibility asynchronously
   */
  private static async verifyUrlAsync(url: string): Promise<void> {
    try {
      console.log('📤 EnhancedUpload - Verifying URL accessibility...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('📤 EnhancedUpload - ✅ URL verification passed');
      } else {
        console.warn('📤 EnhancedUpload - ⚠️ URL verification failed, status:', response.status);
      }
      
    } catch (error) {
      console.warn('📤 EnhancedUpload - ⚠️ URL verification error:', error);
    }
  }
}
