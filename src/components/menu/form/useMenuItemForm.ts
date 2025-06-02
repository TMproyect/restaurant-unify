
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { menuItemFormSchema, MenuItemFormValues } from './schemas/menuItemFormSchema';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';

export type { MenuItemFormValues } from './schemas/menuItemFormSchema';

export const useMenuItemForm = (
  item: MenuItem | null,
  onClose: (saved: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image_url || null);

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

  // Simple file selection with preview
  const handleFileSelection = async (file: File) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(item?.image_url || null);
  };

  // Improved upload to Supabase with better validation
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `menu/${Date.now()}.${fileExtension}`;

      console.log('🖼️ Subiendo imagen:', fileName);

      const { data, error } = await supabase.storage
        .from('menu_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('❌ Error en upload:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      if (!data || !data.path) {
        throw new Error('No se recibió la ruta del archivo subido');
      }

      console.log('✅ Imagen subida exitosamente:', data.path);

      const { data: urlData } = supabase.storage
        .from('menu_images')
        .getPublicUrl(data.path);

      if (!urlData.publicUrl) {
        throw new Error('No se pudo generar la URL pública de la imagen');
      }

      console.log('✅ URL pública generada:', urlData.publicUrl);
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('❌ Error completo en uploadImageToSupabase:', error);
      throw error;
    }
  };

  // Simple form submission
  const onSubmit = async (data: MenuItemFormValues) => {
    setIsLoading(true);
    
    try {
      let imageUrl = item?.image_url;

      // Upload image if new file selected
      if (imageFile) {
        console.log('🖼️ Subiendo nueva imagen...');
        imageUrl = await uploadImageToSupabase(imageFile);
        
        if (!imageUrl) {
          throw new Error('No se pudo obtener la URL de la imagen subida');
        }
        
        console.log('✅ Imagen procesada correctamente:', imageUrl.substring(0, 50) + '...');
      }

      // Prepare item data
      const itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
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

      // Save to database
      let result: MenuItem | null = null;
      
      if (item) {
        console.log('🔄 Actualizando elemento...');
        result = await updateMenuItem(item.id, itemData);
      } else {
        console.log('➕ Creando nuevo elemento...');
        result = await createMenuItem(itemData);
      }

      if (!result) {
        throw new Error('No se pudo guardar el elemento');
      }

      console.log('✅ Elemento guardado exitosamente:', result.id);
      toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      
      // Close dialog with success flag
      onClose(true);
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar: ${errorMessage}`);
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
