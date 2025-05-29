
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

  // Upload image if one is selected
  const uploadImage = async (currentImageUrl?: string): Promise<string | undefined> => {
    let imageUrl = currentImageUrl;
    console.log('🖼️ ImageHandler - Current imageUrl:', imageUrl);
    
    // Upload image if a new one has been selected
    if (imageFile) {
      console.log('🖼️ ImageHandler - Starting image upload process...');
      console.log('🖼️ ImageHandler - File details before upload:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        lastModified: imageFile.lastModified,
        constructor: imageFile.constructor.name
      });
      
      // Simulate progress of upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);
      
      try {
        // Ensure storage is initialized before uploading images
        console.log('🖼️ ImageHandler - Ensuring storage is initialized...');
        await initializeStorage();
        
        // Generate unique filename with proper extension
        const fileExtension = imageFile.name.split('.').pop() || 'jpg';
        const uniqueFileName = `${generateUUID()}.${fileExtension}`;
        console.log('🖼️ ImageHandler - Generated filename:', uniqueFileName);
        
        console.log('🖼️ ImageHandler - Calling uploadMenuItemImage...');
        const uploadResult = await uploadMenuItemImage(imageFile, uniqueFileName);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        console.log('🖼️ ImageHandler - Upload result:', uploadResult);
        
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
          console.log('🖼️ ImageHandler - Image uploaded successfully, new URL:', imageUrl);
        } else {
          console.error('🖼️ ImageHandler - Upload failed:', uploadResult.error);
          toast.error(`Error al procesar la imagen: ${uploadResult.error}`);
          throw new Error(uploadResult.error);
        }
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    } else {
      console.log('🖼️ ImageHandler - No new image to upload, keeping existing URL');
    }
    
    return imageUrl;
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
