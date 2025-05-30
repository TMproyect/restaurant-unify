
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
    uploadProgress,
    handleFileSelection,
    clearImage,
    uploadImage,
  } = useImageHandler(item?.image_url);

  // Use the form submission hook
  const { submitForm } = useMenuFormSubmission();

  // Simplified form submission
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('📝 Form - Starting simplified form submission');
    console.log('📝 Form - Form data:', {
      name: data.name,
      price: data.price,
      category_id: data.category_id,
      hasImage: !!imageFile,
      isEdit: !!item
    });
    
    setIsLoading(true);
    
    // Shorter timeout
    const timeoutId = setTimeout(() => {
      console.error('📝 Form - Submission timeout');
      setIsLoading(false);
      toast.error('El proceso está tomando demasiado tiempo. Intente de nuevo.');
    }, 15000); // Reduced from 30 to 15 seconds
    
    try {
      // STEP 1: Upload image if needed
      console.log('📝 Form - Processing image...');
      const finalImageUrl = await uploadImage(item?.image_url);
      
      console.log('📝 Form - Image processing result:', {
        hasUrl: !!finalImageUrl,
        urlPreview: finalImageUrl ? finalImageUrl.substring(0, 50) + '...' : 'No URL'
      });
      
      // STEP 2: Submit form
      console.log('📝 Form - Submitting to database...');
      const success = await submitForm(data, finalImageUrl, item, onClose);
      
      if (success) {
        console.log('📝 Form - ✅ Form submission successful');
      } else {
        console.log('📝 Form - ❌ Form submission failed');
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
      clearTimeout(timeoutId);
      setIsLoading(false);
      console.log('📝 Form - Form submission process completed');
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
  };
};
