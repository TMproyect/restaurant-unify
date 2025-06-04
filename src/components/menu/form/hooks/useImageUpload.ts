
import { useState } from 'react';
import { toast } from 'sonner';
import { uploadMenuItemImage } from '@/services/storage/operations/imageUpload';
import { validateSelectedFile } from '../utils/fileValidation';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileSelection = async (file: File) => {
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
    };
    reader.readAsDataURL(validatedFile);
  };

  const clearImage = (fallbackUrl?: string) => {
    console.log('🗑️ Upload Hook: Clearing image, fallback URL:', fallbackUrl || 'none');
    setImageFile(null);
    setImagePreview(fallbackUrl || null);
  };

  const uploadImageWithTimeout = async (): Promise<string | null> => {
    if (!imageFile) {
      console.log('ℹ️ Upload Hook: No image file to upload');
      return null;
    }

    console.log('🚀 Upload Hook: Starting upload with timeout...');
    setIsUploading(true);

    try {
      // Crear una promesa de timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Upload timeout after 30 seconds'));
        }, 30000);
      });

      // Crear la promesa de upload
      const uploadPromise = uploadMenuItemImage(imageFile);

      console.log('⏱️ Upload Hook: Racing upload vs timeout...');
      
      // Correr ambas promesas, la primera que resuelva gana
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
        toast.error('La subida de imagen tardó demasiado. Intente con una imagen más pequeña.');
      } else {
        toast.error('Error al subir la imagen. El producto se creará sin imagen.');
      }
      
      return null;
    } finally {
      console.log('🏁 Upload Hook: Cleaning up upload state');
      setIsUploading(false);
    }
  };

  const forceReset = () => {
    console.log('🔄 Upload Hook: Force resetting all states');
    setIsUploading(false);
    setImageFile(null);
    setImagePreview(null);
  };

  return {
    isUploading,
    imageFile,
    imagePreview,
    handleFileSelection,
    clearImage,
    uploadImageWithTimeout,
    forceReset
  };
};
