
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { initializeStorage, uploadMenuItemImage } from '@/services/storage/index';
import { generateUUID } from '../utils/formUtils';

export const useImageHandler = (itemImageUrl?: string) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Set initial image preview if item has an image
  useEffect(() => {
    if (itemImageUrl) {
      console.log('🖼️ ImageHandler - Setting initial image preview:', itemImageUrl);
      setImagePreview(itemImageUrl);
    }
  }, [itemImageUrl]);

  // Initialize storage on hook load
  useEffect(() => {
    const ensureStorageInitialized = async () => {
      try {
        console.log('🖼️ ImageHandler - Initializing storage...');
        await initializeStorage();
        console.log('🖼️ ImageHandler - Storage initialized successfully');
      } catch (error) {
        console.error("🖼️ ImageHandler - Error al inicializar almacenamiento:", error);
      }
    };
    
    ensureStorageInitialized();
  }, []);

  // Handle image selection
  const handleFileSelection = (file: File) => {
    console.log('🖼️ ImageHandler - handleFileSelection called with file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      constructor: file.constructor.name
    });
    
    if (!file) {
      console.error('🖼️ ImageHandler - No file provided to handleFileSelection');
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      console.error('🖼️ ImageHandler - Invalid file type:', file.type);
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      console.error('🖼️ ImageHandler - File too large:', file.size);
      toast.error('La imagen no debe superar los 5MB');
      return;
    }
    
    console.log('🖼️ ImageHandler - Setting imageFile state...');
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('🖼️ ImageHandler - Preview created, length:', result?.length);
      setImagePreview(result);
    };
    reader.onerror = (e) => {
      console.error('🖼️ ImageHandler - Error creating preview:', e);
    };
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const clearImage = () => {
    console.log('🖼️ ImageHandler - Clearing image...');
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  // Upload image if one is selected - SIMPLIFIED VERSION
  const uploadImage = async (currentImageUrl?: string): Promise<string | undefined> => {
    console.log('🖼️ ImageHandler - uploadImage called with:', {
      hasImageFile: !!imageFile,
      currentImageUrl: currentImageUrl ? 'Present' : 'None'
    });
    
    // If no new image selected, return current URL
    if (!imageFile) {
      console.log('🖼️ ImageHandler - No new image to upload, returning current URL:', currentImageUrl);
      return currentImageUrl;
    }

    console.log('🖼️ ImageHandler - Starting upload process for new image...');
    
    try {
      // Ensure storage is initialized
      await initializeStorage();
      
      // Generate unique filename with proper extension
      const fileExtension = imageFile.name.split('.').pop() || 'jpg';
      const uniqueFileName = `${generateUUID()}.${fileExtension}`;
      
      console.log('🖼️ ImageHandler - Generated filename:', uniqueFileName);
      console.log('🖼️ ImageHandler - File details before upload:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size
      });
      
      // Set progress to show upload started
      setUploadProgress(50);
      
      // Upload the image
      const uploadResult = await uploadMenuItemImage(imageFile, uniqueFileName);
      
      console.log('🖼️ ImageHandler - Upload result:', uploadResult);
      
      if (uploadResult.success && uploadResult.imageUrl) {
        setUploadProgress(100);
        console.log('🖼️ ImageHandler - ✅ Upload successful, returning URL:', uploadResult.imageUrl);
        return uploadResult.imageUrl;
      } else {
        setUploadProgress(0);
        const errorMsg = uploadResult.error || 'Error desconocido en upload';
        console.error('🖼️ ImageHandler - ❌ Upload failed:', errorMsg);
        toast.error(`Error al subir imagen: ${errorMsg}`);
        throw new Error(errorMsg);
      }
    } catch (error) {
      setUploadProgress(0);
      console.error('🖼️ ImageHandler - ❌ Exception during upload:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al procesar imagen: ${errorMsg}`);
      throw error;
    }
  };

  return {
    imageFile,
    imagePreview,
    uploadProgress,
    handleFileSelection,
    clearImage,
    uploadImage,
    setImageFile,
    setUploadProgress,
  };
};
