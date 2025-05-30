
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

  // Use the enhanced image handler hook
  const {
    imageFile,
    imagePreview,
    uploadProgress,
    handleFileSelection,
    clearImage,
    uploadImage,
  } = useImageHandler(item?.image_url);

  // Use the enhanced form submission hook
  const { submitForm } = useMenuFormSubmission();

  // Enhanced form submission with improved flow and error handling
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('📝 Form - ⭐ STARTING ENHANCED COMPLETE FORM SUBMISSION PROCESS');
    console.log('📝 Form - Form data:', {
      name: data.name,
      price: data.price,
      category_id: data.category_id,
      hasImage: !!imageFile,
      isEdit: !!item
    });
    
    setIsLoading(true);
    
    // Set up timeout protection with optimized time
    const timeoutId = setTimeout(() => {
      console.error('📝 Form - ⏰ SUBMISSION TIMEOUT - Process taking too long');
      setIsLoading(false);
      toast.error('El proceso está tomando demasiado tiempo. Intente de nuevo.');
    }, 30000); // Optimized to 30 seconds for enhanced upload
    
    try {
      // STEP 1: Upload image and get verified URL with enhanced validation
      console.log('📝 Form - 🔄 STEP 1: Processing image upload with enhanced validation...');
      const finalImageUrl = await uploadImage(item?.image_url);
      
      console.log('📝 Form - ✅ STEP 1 COMPLETE: Enhanced image processing result:', {
        hasUrl: !!finalImageUrl,
        urlPreview: finalImageUrl ? finalImageUrl.substring(0, 50) + '...' : 'No URL',
        previousUrl: item?.image_url ? 'Had previous' : 'No previous'
      });
      
      // STEP 2: Submit form with the verified image URL
      console.log('📝 Form - 🔄 STEP 2: Submitting to database with enhanced verification...');
      const success = await submitForm(data, finalImageUrl, item, onClose);
      
      console.log('📝 Form - ✅ STEP 2 COMPLETE: Enhanced database submission result:', success);
      
      if (success) {
        console.log('📝 Form - 🎉 ENHANCED COMPLETE SUBMISSION SUCCESSFUL');
      } else {
        console.log('📝 Form - ❌ ENHANCED SUBMISSION FAILED');
      }
      
    } catch (error) {
      console.error('📝 Form - ❌ EXCEPTION IN ENHANCED COMPLETE SUBMISSION PROCESS:', error);
      
      // Show specific error message based on error type
      if (error instanceof Error) {
        if (error.message.includes('bucket') || error.message.includes('storage')) {
          toast.error('Error de configuración de almacenamiento. Contacte al administrador.');
        } else if (error.message.includes('image') || error.message.includes('upload')) {
          toast.error('Error al procesar la imagen. Verifique el archivo e intente de nuevo.');
        } else {
          toast.error('Error en el proceso de guardado. Intente de nuevo.');
        }
      } else {
        toast.error('Error desconocido. Intente de nuevo.');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      console.log('📝 Form - 🏁 ENHANCED FORM SUBMISSION PROCESS FINALIZED');
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
