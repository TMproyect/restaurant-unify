import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { menuItemFormSchema, MenuItemFormValues } from './schemas/menuItemFormSchema';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';
import { useImageUpload } from './hooks/useImageUpload';

export type { MenuItemFormValues } from './schemas/menuItemFormSchema';

export const useMenuItemForm = (
  item: MenuItem | null,
  onClose: (saved: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar el nuevo hook de upload
  const {
    isUploading: isUploadingImage,
    imageFile,
    imagePreview,
    handleFileSelection,
    clearImage,
    uploadImageWithTimeout,
    forceReset
  } = useImageUpload();

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

  // Inicializar preview con imagen existente
  React.useEffect(() => {
    if (item?.image_url && !imagePreview) {
      clearImage(item.image_url);
    }
  }, [item?.image_url, imagePreview, clearImage]);

  // Función para crear/actualizar item sin depender del upload
  const saveMenuItem = async (data: MenuItemFormValues, imageUrl?: string | null): Promise<MenuItem | null> => {
    console.log('💾 Form: Saving menu item with data:', {
      ...data,
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'none'
    });

    const itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      category_id: data.category_id,
      available: data.available,
      popular: data.popular,
      allergens: data.allergens || [],
      sku: data.sku || '',
      image_url: imageUrl || item?.image_url || null,
    };

    try {
      let result: MenuItem | null = null;
      
      if (item) {
        console.log('🔄 Form: Updating existing item with ID:', item.id);
        result = await updateMenuItem(item.id, itemData);
      } else {
        console.log('➕ Form: Creating new item');
        result = await createMenuItem(itemData);
      }

      if (!result) {
        throw new Error('Failed to save item - no result returned');
      }

      console.log('✅ Form: Item saved successfully with ID:', result.id);
      return result;

    } catch (error) {
      console.error('❌ Form: Error saving item:', error);
      throw error;
    }
  };

  // Función principal de envío con flujo separado
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('🚀 Form: Starting submission process');
    console.log('📋 Form: Form data:', data);
    console.log('🖼️ Form: Has image file:', !!imageFile);
    console.log('📝 Form: Is edit mode:', !!item);
    
    setIsLoading(true);
    
    try {
      let savedItem: MenuItem | null = null;
      let finalImageUrl: string | null = item?.image_url || null;

      // PASO 1: Intentar subir imagen SI hay una nueva seleccionada
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
          // Continuar con el guardado del producto
        }
      }

      // PASO 2: Guardar el producto (SIEMPRE, independientemente del resultado del upload)
      console.log('💾 Form: Saving menu item...');
      savedItem = await saveMenuItem(data, finalImageUrl);

      if (!savedItem) {
        throw new Error('Failed to save menu item');
      }

      // PASO 3: Éxito completo
      console.log('🎉 Form: Process completed successfully');
      toast.success(item ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
      
      // Trigger refresh
      console.log('🔄 Form: Triggering refresh event');
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      
      // Close dialog
      console.log('🚪 Form: Closing dialog with saved=true');
      onClose(true);
      
    } catch (error) {
      console.error('❌ Form: Complete submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar producto: ${errorMessage}`);
    } finally {
      console.log('🧹 Form: Cleaning up loading states');
      setIsLoading(false);
      // No resetear isUploadingImage aquí - el hook se encarga de eso
    }
  };

  // Función de emergencia para resetear todo
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
