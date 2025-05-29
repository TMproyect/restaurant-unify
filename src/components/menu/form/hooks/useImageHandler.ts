
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

  // Verify URL is accessible with timeout
  const verifyImageUrl = async (url: string): Promise<boolean> => {
    try {
      console.log('🖼️ ImageHandler - Verifying URL accessibility:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const isAccessible = response.ok;
      console.log('🖼️ ImageHandler - URL verification result:', {
        url: url.substring(0, 50) + '...',
        status: response.status,
        ok: response.ok,
        accessible: isAccessible
      });
      
      return isAccessible;
    } catch (error) {
      console.error('🖼️ ImageHandler - URL verification failed:', error);
      return false;
    }
  };

  // Upload image with robust error handling and URL verification
  const uploadImage = async (currentImageUrl?: string): Promise<string | undefined> => {
    console.log('🖼️ ImageHandler - ⭐ STARTING UPLOAD PROCESS');
    console.log('🖼️ ImageHandler - Upload state:', {
      hasNewImage: !!imageFile,
      currentUrl: currentImageUrl ? 'Present' : 'None',
      fileName: imageFile?.name || 'N/A'
    });
    
    // If no new image selected, return current URL
    if (!imageFile) {
      console.log('🖼️ ImageHandler - No new image to upload, returning current URL');
      return currentImageUrl;
    }

    console.log('🖼️ ImageHandler - 🔄 Processing new image upload...');
    
    try {
      // Reset progress
      setUploadProgress(0);
      
      // Ensure storage is initialized
      console.log('🖼️ ImageHandler - Ensuring storage initialization...');
      await initializeStorage();
      
      // Generate unique filename with proper extension
      const fileExtension = imageFile.name.split('.').pop() || 'jpg';
      const uniqueFileName = `${generateUUID()}.${fileExtension}`;
      
      console.log('🖼️ ImageHandler - Upload details:', {
        originalName: imageFile.name,
        generatedName: uniqueFileName,
        type: imageFile.type,
        size: imageFile.size
      });
      
      // Set progress to indicate upload started
      setUploadProgress(50);
      
      // Upload the image
      console.log('🖼️ ImageHandler - 🚀 Starting upload to Supabase Storage...');
      const uploadResult = await uploadMenuItemImage(imageFile, uniqueFileName);
      
      console.log('🖼️ ImageHandler - Upload result received:', {
        success: uploadResult.success,
        hasUrl: !!uploadResult.imageUrl,
        urlPreview: uploadResult.imageUrl ? uploadResult.imageUrl.substring(0, 50) + '...' : 'None',
        error: uploadResult.error || 'None'
      });
      
      if (!uploadResult.success || !uploadResult.imageUrl) {
        setUploadProgress(0);
        const errorMsg = uploadResult.error || 'Error desconocido en upload';
        console.error('🖼️ ImageHandler - ❌ Upload failed:', errorMsg);
        toast.error(`Error al subir imagen: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      // Verify the uploaded URL is accessible
      console.log('🖼️ ImageHandler - 🔍 Verifying uploaded URL accessibility...');
      const isUrlAccessible = await verifyImageUrl(uploadResult.imageUrl);
      
      if (!isUrlAccessible) {
        setUploadProgress(0);
        console.error('🖼️ ImageHandler - ❌ Uploaded URL is not accessible');
        toast.error('La imagen se subió pero no es accesible. Intente de nuevo.');
        throw new Error('URL no accesible después del upload');
      }
      
      // Success - set progress to complete
      setUploadProgress(100);
      
      console.log('🖼️ ImageHandler - ✅ UPLOAD PROCESS COMPLETED SUCCESSFULLY');
      console.log('🖼️ ImageHandler - Final URL:', uploadResult.imageUrl);
      
      return uploadResult.imageUrl;
      
    } catch (error) {
      setUploadProgress(0);
      console.error('🖼️ ImageHandler - ❌ EXCEPTION IN UPLOAD PROCESS:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al procesar imagen: ${errorMsg}`);
      
      throw error; // Re-throw to be handled by the form submission
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
