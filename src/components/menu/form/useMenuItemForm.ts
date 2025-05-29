
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

  // Handle form submission with timeout protection
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('📝 Form - ⭐ STARTING COMPLETE FORM SUBMISSION PROCESS');
    console.log('📝 Form - Form data:', {
      name: data.name,
      price: data.price,
      category_id: data.category_id,
      hasImage: !!imageFile,
      isEdit: !!item
    });
    
    setIsLoading(true);
    
    // Set up timeout protection
    const timeoutId = setTimeout(() => {
      console.error('📝 Form - ⏰ SUBMISSION TIMEOUT - Process taking too long');
      setIsLoading(false);
      toast.error('El proceso está tomando demasiado tiempo. Intente de nuevo.');
    }, 60000); // 60 second timeout
    
    try {
      // STEP 1: Upload image and get verified URL
      console.log('📝 Form - 🔄 STEP 1: Processing image upload...');
      const finalImageUrl = await uploadImage(item?.image_url);
      
      console.log('📝 Form - ✅ STEP 1 COMPLETE: Image processing result:', {
        hasUrl: !!finalImageUrl,
        urlPreview: finalImageUrl ? finalImageUrl.substring(0, 50) + '...' : 'No URL',
        previousUrl: item?.image_url ? 'Had previous' : 'No previous'
      });
      
      // STEP 2: Submit form with the verified image URL
      console.log('📝 Form - 🔄 STEP 2: Submitting to database...');
      const success = await submitForm(data, finalImageUrl, item, onClose);
      
      console.log('📝 Form - ✅ STEP 2 COMPLETE: Database submission result:', success);
      
      if (success) {
        console.log('📝 Form - 🎉 COMPLETE SUBMISSION SUCCESSFUL');
        // Reset states on success
        setUploadProgress(0);
        setImageFile(null);
      } else {
        console.log('📝 Form - ❌ SUBMISSION FAILED');
      }
      
    } catch (error) {
      console.error('📝 Form - ❌ EXCEPTION IN COMPLETE SUBMISSION PROCESS:', error);
      setUploadProgress(0);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      console.log('📝 Form - 🏁 FORM SUBMISSION PROCESS FINALIZED');
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
