
import { useState, useEffect } from 'react';
import { validateImageFile, createImagePreview } from '../utils/imageValidation';
import { ImageUploadService } from '../services/imageUploadService';

export const useImageHandler = (itemImageUrl?: string) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Set initial image preview if item has an image
  useEffect(() => {
    if (itemImageUrl) {
      console.log('🖼️ ImageHandler - Setting initial image preview:', itemImageUrl);
      setImagePreview(itemImageUrl);
    }
  }, [itemImageUrl]);

  // Handle image selection with validation
  const handleFileSelection = async (file: File) => {
    console.log('🖼️ ImageHandler - File selected:', file.name);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      console.error('🖼️ ImageHandler - File validation failed:', validation.error);
      return;
    }

    setImageFile(file);

    // Create preview
    try {
      const preview = await createImagePreview(file);
      setImagePreview(preview);
    } catch (error) {
      console.error('🖼️ ImageHandler - Error creating preview:', error);
    }
  };

  // Clear selected image
  const clearImage = () => {
    console.log('🖼️ ImageHandler - Clearing image...');
    setImageFile(null);
    setImagePreview(null);
    setIsUploading(false);
  };

  // Simple upload process
  const uploadImage = async (currentImageUrl?: string): Promise<string | undefined> => {
    console.log('🖼️ ImageHandler - Starting upload');

    if (!imageFile) {
      return currentImageUrl;
    }

    try {
      setIsUploading(true);

      const result = await ImageUploadService.handleMenuItemImageUpload(
        imageFile,
        currentImageUrl
      );

      console.log('🖼️ ImageHandler - ✅ Upload completed');
      return result;

    } catch (error) {
      console.error('🖼️ ImageHandler - Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    imageFile,
    imagePreview,
    isUploading,
    handleFileSelection,
    clearImage,
    uploadImage,
  };
};
