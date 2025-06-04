
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { menuItemFormSchema, MenuItemFormValues } from './schemas/menuItemFormSchema';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';
import { uploadMenuItemImage } from '@/services/storage/operations/imageUpload';

export type { MenuItemFormValues } from './schemas/menuItemFormSchema';

export const useMenuItemForm = (
  item: MenuItem | null,
  onClose: (saved: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.image_url || null
  );

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

  const resetForm = () => {
    console.log('🔄 Resetting form');
    setIsLoading(false);
    setImageFile(null);
    setImagePreview(item?.image_url || null);
    form.reset({
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      category_id: item?.category_id || '',
      available: item?.available ?? true,
      popular: item?.popular ?? false,
      allergens: item?.allergens || [],
      sku: item?.sku || '',
    });
  };

  const handleFileSelection = (file: File) => {
    console.log('📁 File selected:', file.name);
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      console.log('🖼️ Image preview set');
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    console.log('🗑️ Clearing image');
    setImageFile(null);
    setImagePreview(item?.image_url || null);
  };

  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('🚀 Form submitted:', data);
    
    if (isLoading) {
      console.log('⚠️ Already loading, ignoring submit');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create or update product first
      const productData = {
        name: data.name,
        description: data.description || '',
        price: data.price,
        category_id: data.category_id,
        available: data.available,
        popular: data.popular,
        allergens: data.allergens || [],
        sku: data.sku || '',
        image_url: item?.image_url || null,
      };

      let productResult;
      if (item) {
        productResult = await updateMenuItem(item.id, productData);
        console.log('✅ Product updated');
      } else {
        productResult = await createMenuItem(productData);
        console.log('✅ Product created');
      }

      if (!productResult) {
        throw new Error('No se pudo crear/actualizar el producto');
      }

      // If there's a new image, try to upload it
      if (imageFile && productResult) {
        try {
          console.log('🖼️ Uploading image...');
          const uploadResult = await uploadMenuItemImage(imageFile);
          
          if (uploadResult.success && uploadResult.imageUrl) {
            const updateData = { ...productData, image_url: uploadResult.imageUrl };
            
            if (item) {
              await updateMenuItem(item.id, updateData);
            } else if (productResult.id) {
              await updateMenuItem(productResult.id, updateData);
            }
            
            console.log('✅ Product updated with image');
          } else {
            console.warn('⚠️ Image upload failed');
            toast.warning('Producto guardado, pero no se pudo subir la imagen');
          }
        } catch (imageError) {
          console.warn('⚠️ Image upload error:', imageError);
          toast.warning('Producto guardado, pero falló la subida de imagen');
        }
      }

      toast.success(item ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
      
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      onClose(true);

    } catch (error) {
      console.error('❌ Error in submit:', error);
      toast.error('Error al guardar el producto. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    imageFile,
    imagePreview,
    handleFileSelection,
    clearImage,
    onSubmit,
    resetForm,
  };
};
