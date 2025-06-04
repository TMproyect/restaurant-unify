
import React, { useState } from 'react';
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { MenuItemFormValues } from './schemas/menuItemFormSchema';
import { useImageUpload } from './hooks/useImageUpload';
import { useMenuFormState } from './hooks/useMenuFormState';
import { MenuItemOperations } from './services/menuItemOperations';

export type { MenuItemFormValues } from './schemas/menuItemFormSchema';

export const useMenuItemForm = (
  item: MenuItem | null,
  onClose: (saved: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Use separate hooks for focused responsibilities
  const { form } = useMenuFormState(item);
  const {
    isUploading: isUploadingImage,
    imageFile,
    imagePreview,
    handleFileSelection,
    clearImage,
    uploadImageWithTimeout,
    forceReset
  } = useImageUpload();

  // Initialize preview with existing image
  React.useEffect(() => {
    if (item?.image_url && !imagePreview) {
      clearImage(item.image_url);
    }
  }, [item?.image_url, imagePreview, clearImage]);

  /**
   * Main submission handler with separated flow
   */
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('🚀 Form: Starting submission process');
    console.log('📋 Form: Form data:', data);
    console.log('🖼️ Form: Has image file:', !!imageFile);
    console.log('📝 Form: Is edit mode:', !!item);
    
    setIsLoading(true);
    
    try {
      let savedItem: MenuItem | null = null;
      let finalImageUrl: string | null = item?.image_url || null;

      // STEP 1: Attempt image upload IF there's a new file selected
      if (imageFile) {
        console.log('📤 Form: Attempting image upload...');
        
        try {
          const uploadedUrl = await uploadImageWithTimeout();
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            console.log('✅ Form: Image uploaded successfully');
          } else {
            console.log('⚠️ Form: Image upload failed, continuing without new image');
            toast.warning('La imagen no se pudo subir, pero el producto se guardará sin ella');
          }
        } catch (uploadError) {
          console.error('❌ Form: Image upload error:', uploadError);
          toast.warning('Error al subir imagen, guardando producto sin ella');
          // Continue with product save
        }
      }

      // STEP 2: Save the product (ALWAYS, regardless of upload result)
      console.log('💾 Form: Saving menu item...');
      savedItem = await MenuItemOperations.saveMenuItem(data, item, finalImageUrl);

      if (!savedItem) {
        throw new Error('Failed to save menu item');
      }

      // STEP 3: Complete success
      console.log('🎉 Form: Process completed successfully');
      MenuItemOperations.showSuccessMessage(!!item);
      MenuItemOperations.triggerRefresh();
      
      // Close dialog
      console.log('🚪 Form: Closing dialog with saved=true');
      onClose(true);
      
    } catch (error) {
      console.error('❌ Form: Complete submission failed:', error);
      MenuItemOperations.showErrorMessage(error);
    } finally {
      console.log('🧹 Form: Cleaning up loading states');
      setIsLoading(false);
      // Note: Don't reset isUploadingImage here - the hook handles that
    }
  };

  /**
   * Emergency reset function for stuck states
   */
  const emergencyReset = () => {
    console.log('🚨 Form: Emergency reset triggered');
    setIsLoading(false);
    forceReset();
    toast.info('Estados reseteados. Puede intentar de nuevo.');
  };

  return {
    form,
    isLoading,
    isUploadingImage,
    imageFile,
    imagePreview,
    handleFileSelection,
    clearImage,
    onSubmit,
    emergencyReset,
  };
};
