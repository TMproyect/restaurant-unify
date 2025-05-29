
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { menuItemFormSchema, MenuItemFormValues } from './schemas/menuItemFormSchema';
import { useImageHandler } from './hooks/useImageHandler';
import { useMenuFormSubmission } from './hooks/useMenuFormSubmission';

export type { MenuItemFormValues } from './schemas/menuItemFormSchema';

export const useMenuItemForm = (
  item: MenuItem | null,
  onClose: (saved: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with default values
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      category_id: item?.category_id || '',
      available: item?.available ?? true,
      popular: item?.popular ?? false,
      allergens: item?.allergens || [],
      sku: item?.sku || '',
    },
  });

  // Use the image handler hook
  const {
    imageFile,
    imagePreview,
    uploadProgress,
    handleFileSelection,
    clearImage,
    uploadImage,
    setImageFile,
    setUploadProgress,
  } = useImageHandler(item?.image_url);

  // Use the form submission hook
  const { submitForm } = useMenuFormSubmission();

  // Handle form submission - SIMPLIFIED AND SYNCHRONIZED
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('📝 Form - ⭐ STARTING FORM SUBMISSION');
    console.log('📝 Form - Form data:', data);
    console.log('📝 Form - Image state:', {
      hasFile: !!imageFile,
      fileName: imageFile?.name,
      currentImageUrl: item?.image_url ? 'Present' : 'None'
    });
    
    setIsLoading(true);
    
    try {
      // STEP 1: Upload image first and get URL
      console.log('📝 Form - 🔄 STEP 1: Uploading image...');
      const finalImageUrl = await uploadImage(item?.image_url);
      
      console.log('📝 Form - ✅ STEP 1 COMPLETE: Image upload result:', {
        url: finalImageUrl ? `${finalImageUrl.substring(0, 50)}...` : 'None',
        hasUrl: !!finalImageUrl
      });
      
      // STEP 2: Submit form with the final image URL
      console.log('📝 Form - 🔄 STEP 2: Submitting form to database...');
      const success = await submitForm(data, finalImageUrl, item, onClose);
      
      console.log('📝 Form - ✅ STEP 2 COMPLETE: Database submission result:', success);
      
      if (success) {
        console.log('📝 Form - 🎉 SUBMISSION SUCCESSFUL');
        // Reset states on success
        setUploadProgress(0);
        setImageFile(null);
      } else {
        console.log('📝 Form - ❌ SUBMISSION FAILED');
      }
      
    } catch (error) {
      console.error('📝 Form - ❌ ERROR IN FORM SUBMISSION:', error);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
      console.log('📝 Form - 🏁 FORM SUBMISSION PROCESS COMPLETE');
    }
  };

  return {
    form,
    isLoading,
    imageFile,
    imagePreview,
    uploadProgress,
    handleFileSelection,
    clearImage,
    onSubmit,
    setImageFile,
    setUploadProgress,
  };
};
