
import React, { useState, useEffect } from 'react';
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
    forceReset,
    autoReset
  } = useImageUpload();

  // Auto-reset cuando se abre/cierra el formulario
  useEffect(() => {
    console.log('🔄 Form: Auto-resetting states on form initialization');
    autoReset();
    
    // Initialize preview with existing image
    if (item?.image_url && !imagePreview) {
      clearImage(item.image_url);
    }
  }, [item?.id, autoReset, item?.image_url, imagePreview, clearImage]);

  // Resetear estados cuando hay errores persistentes
  const handleErrorRecovery = React.useCallback(() => {
    console.log('🚨 Form: Performing error recovery');
    setIsLoading(false);
    autoReset();
    form.clearErrors();
    toast.info('Estados limpiados. Intente nuevamente.');
  }, [autoReset, form]);

  /**
   * Main submission handler with improved error handling
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

      // PASO 1: Intentar subir imagen SOLO si hay archivo nuevo
      if (imageFile) {
        console.log('📤 Form: Attempting image upload...');
        
        try {
          const uploadedUrl = await uploadImageWithTimeout();
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            console.log('✅ Form: Image uploaded successfully');
            toast.success('Imagen subida correctamente');
          } else {
            console.log('⚠️ Form: Image upload failed, continuing without new image');
            toast.warning('No se pudo subir la imagen, pero el producto se guardará');
          }
        } catch (uploadError) {
          console.error('❌ Form: Image upload error:', uploadError);
          toast.warning('Error al subir imagen, guardando producto sin ella');
          // Continuar con la creación del producto
        }
      } else {
        console.log('ℹ️ Form: No new image to upload');
      }

      // PASO 2: Guardar el producto (SIEMPRE, independientemente del resultado del upload)
      console.log('💾 Form: Saving menu item...');
      savedItem = await MenuItemOperations.saveMenuItem(data, item, finalImageUrl);

      if (!savedItem) {
        throw new Error('Failed to save menu item');
      }

      // PASO 3: Éxito completo
      console.log('🎉 Form: Process completed successfully');
      MenuItemOperations.showSuccessMessage(!!item);
      MenuItemOperations.triggerRefresh();
      
      // Limpiar estados antes de cerrar
      console.log('🧹 Form: Cleaning up before closing');
      autoReset();
      form.reset();
      
      // Cerrar diálogo
      console.log('🚪 Form: Closing dialog with saved=true');
      onClose(true);
      
    } catch (error) {
      console.error('❌ Form: Complete submission failed:', error);
      MenuItemOperations.showErrorMessage(error);
      
      // En caso de error, ofrecer recuperación automática
      setTimeout(() => {
        handleErrorRecovery();
      }, 2000);
      
    } finally {
      console.log('🧹 Form: Cleaning up loading states');
      setIsLoading(false);
    }
  };

  /**
   * Emergency reset function for stuck states
   */
  const emergencyReset = () => {
    console.log('🚨 Form: Emergency reset triggered');
    setIsLoading(false);
    forceReset();
    form.reset();
    form.clearErrors();
    toast.info('Todos los estados fueron reseteados. Puede intentar de nuevo.');
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
