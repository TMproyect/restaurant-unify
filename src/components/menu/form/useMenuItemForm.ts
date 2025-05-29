
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { menuItemFormSchema, MenuItemFormValues } from './schemas/menuItemFormSchema';
import { useImageHandler } from './hooks/useImageHandler';
import { useMenuFormSubmission } from './hooks/useMenuFormSubmission';

export { MenuItemFormValues } from './schemas/menuItemFormSchema';

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

  // Handle form submission
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('📝 Form - Form submission started with data:', data);
    console.log('📝 Form - Current imageFile state:', {
      hasFile: !!imageFile,
      fileName: imageFile?.name,
      fileType: imageFile?.type,
      fileSize: imageFile?.size
    });
    
    setIsLoading(true);
    try {
      // Upload image if needed
      const imageUrl = await uploadImage(item?.image_url);
      
      // Submit the form
      await submitForm(data, imageUrl, item, onClose);
    } catch (error) {
      console.error('📝 Form - Error in form submission:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
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
