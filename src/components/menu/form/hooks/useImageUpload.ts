
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadMenuItemImage } from '@/services/storage/operations/imageUpload';
import { validateSelectedFile } from '../utils/fileValidation';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileSelection = useCallback(async (file: File) => {
    console.log('🖼️ Upload Hook: File selected for upload:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const validatedFile = validateSelectedFile(file);
    if (!validatedFile) {
      console.error('❌ Upload Hook: File validation failed');
      return;
    }

    setImageFile(validatedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('✅ Upload Hook: Preview created successfully');
      setImagePreview(result);
    };
    reader.onerror = (e) => {
      console.error('❌ Upload Hook: Error creating preview:', e);
      toast.error('Error al crear vista previa de la imagen');
      // Reset states on preview error
      setImageFile(null);
      setImagePreview(null);
    };
    reader.readAsDataURL(validatedFile);
  }, []);

  const clearImage = useCallback((fallbackUrl?: string) => {
    console.log('🗑️ Upload Hook: Clearing image, fallback URL:', fallbackUrl || 'none');
    setImageFile(null);
    setImagePreview(fallbackUrl || null);
  }, []);

  const uploadImageWithTimeout = useCallback(async (): Promise<string | null> => {
    if (!imageFile) {
      console.log('ℹ️ Upload Hook: No image file to upload');
      return null;
    }

    console.log('🚀 Upload Hook: Starting upload with 60s timeout...');
    setIsUploading(true);

    try {
      // Timeout más largo: 60 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Upload timeout after 60 seconds'));
        }, 60000);
      });

      const uploadPromise = uploadMenuItemImage(imageFile);

      console.log('⏱️ Upload Hook: Racing upload vs 60s timeout...');
      
      const result = await Promise.race([uploadPromise, timeoutPromise]);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ Upload Hook: Upload completed successfully');
      console.log('📸 Upload Hook: Image URL:', result.imageUrl?.substring(0, 50) + '...');
      
      return result.imageUrl || null;

    } catch (error) {
      console.error('❌ Upload Hook: Upload failed with error:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log('⏰ Upload Hook: Timeout detected, showing user-friendly message');
        toast.error('La subida de imagen tardó más de 60 segundos. El producto se creará sin imagen.');
      } else if (error instanceof Error && error.message.includes('storage')) {
        console.log('💾 Upload Hook: Storage error detected');
        toast.error('Error en el sistema de almacenamiento. El producto se creará sin imagen.');
      } else {
        console.log('❓ Upload Hook: Other error detected');
        toast.error('Error al subir la imagen. El producto se creará sin imagen.');
      }
      
      return null;
    } finally {
      console.log('🏁 Upload Hook: Cleaning up upload state');
      setIsUploading(false);
    }
  }, [imageFile]);

  const forceReset = useCallback(() => {
    console.log('🔄 Upload Hook: Force resetting all states');
    setIsUploading(false);
    setImageFile(null);
    setImagePreview(null);
  }, []);

  // Función de reseteo automático más robusta
  const autoReset = useCallback(() => {
    console.log('🔄 Upload Hook: Auto resetting all states');
    setIsUploading(false);
    setImageFile(null);
    setImagePreview(null);
  }, []);

  return {
    isUploading,
    imageFile,
    imagePreview,
    handleFileSelection,
    clearImage,
    uploadImageWithTimeout,
    forceReset,
    autoReset
  };
};
