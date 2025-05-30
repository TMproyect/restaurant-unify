
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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

  // Use the simplified image handler hook
  const {
    imageFile,
    imagePreview,
    isUploading,
    handleFileSelection,
    clearImage,
    uploadImage,
  } = useImageHandler(item?.image_url);

  // Use the form submission hook
  const { submitForm } = useMenuFormSubmission();

  // Simple form submission
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('📝 Form - Starting form submission');
    
    setIsLoading(true);
    
    try {
      // STEP 1: Upload image if needed
      console.log('📝 Form - Processing image...');
      const finalImageUrl = await uploadImage(item?.image_url);
      
      // STEP 2: Submit form
      console.log('📝 Form - Submitting to database...');
      const success = await submitForm(data, finalImageUrl, item, onClose);
      
      if (success) {
        console.log('📝 Form - ✅ Form submission successful');
      }
      
    } catch (error) {
      console.error('📝 Form - Exception in form submission:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('image') || error.message.includes('upload')) {
          toast.error('Error al procesar la imagen. Intente de nuevo.');
        } else {
          toast.error('Error al guardar el elemento. Intente de nuevo.');
        }
      } else {
        toast.error('Error desconocido. Intente de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading: isLoading || isUploading,
    imageFile,
    imagePreview,
    uploadProgress: isUploading ? 50 : 0,
    handleFileSelection,
    clearImage,
    onSubmit,
  };
};
