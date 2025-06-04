
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

  const handleFileSelection = (file: File) => {
    console.log('File selected:', file.name);
    setImageFile(file);
    
    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(item?.image_url || null);
  };

  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('Form submitted:', data);
    setIsLoading(true);
    
    try {
      let imageUrl = item?.image_url || null;

      // Upload image if there's a new file
      if (imageFile) {
        console.log('Uploading image...');
        const uploadResult = await uploadMenuItemImage(imageFile);
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
          console.log('Image uploaded successfully');
        } else {
          console.warn('Image upload failed, continuing without image');
          toast.warning('No se pudo subir la imagen, pero el producto se guardará');
        }
      }

      // Create/update product
      const itemData = {
        name: data.name,
        description: data.description || '',
        price: data.price,
        category_id: data.category_id,
        available: data.available,
        popular: data.popular,
        allergens: data.allergens || [],
        sku: data.sku || '',
        image_url: imageUrl,
      };

      let result;
      if (item) {
        result = await updateMenuItem(item.id, itemData);
        toast.success('Producto actualizado con éxito');
      } else {
        result = await createMenuItem(itemData);
        toast.success('Producto creado con éxito');
      }

      if (result) {
        // Trigger refresh
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        onClose(true);
      }

    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Error al guardar el producto');
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
  };
};
