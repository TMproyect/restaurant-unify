
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { menuItemFormSchema, MenuItemFormValues } from './schemas/menuItemFormSchema';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';
import { validateSelectedFile, generateUniqueFileName } from './utils/fileValidation';

export type { MenuItemFormValues } from './schemas/menuItemFormSchema';

export const useMenuItemForm = (
  item: MenuItem | null,
  onClose: (saved: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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

  // Manejo de selección de archivo con validación
  const handleFileSelection = async (file: File) => {
    console.log('🔄 Form: File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      isFile: file instanceof File
    });

    const validatedFile = validateSelectedFile(file);
    if (!validatedFile) {
      console.error('❌ Form: File validation failed');
      return;
    }

    setImageFile(validatedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('✅ Form: Preview created');
      setImagePreview(result);
    };
    reader.onerror = (e) => {
      console.error('❌ Form: Error creating preview:', e);
      toast.error('Error al crear vista previa de la imagen');
    };
    reader.readAsDataURL(validatedFile);
  };

  // Clear image
  const clearImage = () => {
    console.log('🔄 Form: Clearing image');
    setImageFile(null);
    setImagePreview(item?.image_url || null);
  };

  // Upload simplificado a Supabase
  const uploadImageToSupabase = async (fileToUpload: File): Promise<string | null> => {
    try {
      console.log('📤 Form: Starting image upload...');

      if (!(fileToUpload instanceof File)) {
        throw new Error("Invalid file object for upload");
      }

      const uniqueFileName = generateUniqueFileName(fileToUpload.name);
      const filePath = `menu/${uniqueFileName}`;

      const uploadOptions = {
        cacheControl: '3600',
        upsert: false
      };

      console.log(`📤 Form: Uploading to path: ${filePath}`);
      console.log(`📤 Form: File details:`, {
        name: fileToUpload.name,
        type: fileToUpload.type,
        size: fileToUpload.size
      });

      const { data, error } = await supabase.storage
        .from('menu_images')
        .upload(filePath, fileToUpload, uploadOptions);

      if (error) {
        console.error('❌ Form: Upload error:', error);
        throw new Error(`Error uploading image: ${error.message}`);
      }

      if (!data?.path) {
        console.error('❌ Form: No path returned from upload');
        throw new Error('No file path returned from upload');
      }

      console.log('✅ Form: Upload successful, path:', data.path);

      const { data: urlData } = supabase.storage
        .from('menu_images')
        .getPublicUrl(data.path);

      if (!urlData.publicUrl) {
        throw new Error('Could not generate public URL');
      }

      console.log('✅ Form: Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('❌ Form: Upload failed:', error);
      throw error;
    }
  };

  // Envío del formulario simplificado con logging detallado
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('🔄 Form: Starting form submission');
    console.log('🔄 Form: Form data:', data);
    console.log('🔄 Form: Has image file:', !!imageFile);
    console.log('🔄 Form: Is edit mode:', !!item);
    
    setIsLoading(true);
    
    try {
      let imageUrl = item?.image_url;

      // Upload image if new file selected
      if (imageFile) {
        console.log('🖼️ Form: Uploading new image...');
        setIsUploadingImage(true);
        
        try {
          imageUrl = await uploadImageToSupabase(imageFile);
          console.log('✅ Form: Image uploaded successfully:', imageUrl?.substring(0, 50) + '...');
        } catch (uploadError) {
          console.error('❌ Form: Image upload failed:', uploadError);
          toast.error('Error al subir la imagen');
          throw uploadError;
        } finally {
          setIsUploadingImage(false);
        }
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

      console.log('💾 Form: Saving item data:', itemData);

      // Save to database
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
      toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
      
      // Trigger refresh
      console.log('🔄 Form: Triggering refresh event');
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      
      // Force dialog close
      console.log('🔄 Form: Closing dialog with saved=true');
      onClose(true);
      
    } catch (error) {
      console.error('❌ Form: Submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
    }
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
  };
};
