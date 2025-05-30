
import { useState, useEffect } from 'react';
import { validateImageFile, createImagePreview } from '../utils/imageValidation';
import { ImageUploadService } from '../services/imageUploadService';

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

  // Handle image selection with validation
  const handleFileSelection = async (file: File) => {
    console.log('🖼️ ImageHandler - handleFileSelection called with file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      console.error('🖼️ ImageHandler - File validation failed:', validation.error);
      return;
    }

    console.log('🖼️ ImageHandler - Setting imageFile state...');
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
    setUploadProgress(0);
  };

  // Upload image with progress tracking and enhanced error handling
  const uploadImage = async (currentImageUrl?: string): Promise<string | undefined> => {
    console.log('🖼️ ImageHandler - ⭐ Starting enhanced upload process');

    try {
      // Set progress to indicate processing
      setUploadProgress(25);

      const result = await ImageUploadService.handleMenuItemImageUpload(
        imageFile,
        currentImageUrl
      );

      // Set progress to complete
      setUploadProgress(100);

      console.log('🖼️ ImageHandler - ✅ Enhanced upload completed successfully');
      return result;

    } catch (error) {
      setUploadProgress(0);
      console.error('🖼️ ImageHandler - ❌ Enhanced upload failed:', error);
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
  };
};
