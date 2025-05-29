
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';
import { initializeStorage, uploadMenuItemImage } from '@/services/storage/index';

// Form validation schema
export const menuItemFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo" }),
  category_id: z.string().min(1, { message: "Seleccione una categoría" }),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  allergens: z.array(z.string()).optional(),
  sku: z.string().optional(),
});

export type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

// Función para generar UUID simple
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useMenuItemForm = (
  item: MenuItem | null,
  onClose: (saved: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Set initial image preview if item has an image
  useEffect(() => {
    if (item?.image_url) {
      console.log('📝 Form - Setting initial image preview:', item.image_url);
      setImagePreview(item.image_url);
    }
  }, [item]);

  // Initialize storage on form load
  useEffect(() => {
    const ensureStorageInitialized = async () => {
      try {
        console.log('📝 Form - Initializing storage...');
        await initializeStorage();
        console.log('📝 Form - Storage initialized successfully');
      } catch (error) {
        console.error("📝 Form - Error al inicializar almacenamiento:", error);
      }
    };
    
    ensureStorageInitialized();
  }, []);

  // Handle image selection
  const handleFileSelection = (file: File) => {
    console.log('📝 Form - handleFileSelection called with file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      constructor: file.constructor.name
    });
    
    if (!file) {
      console.error('📝 Form - No file provided to handleFileSelection');
      return;
    }
    
    // Validate file type - this should already be done in ImageUploader but double-check
    if (!file.type.match('image.*')) {
      console.error('📝 Form - Invalid file type:', file.type);
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    
    // Validate file size - this should already be done in ImageUploader but double-check
    if (file.size > 5 * 1024 * 1024) {
      console.error('📝 Form - File too large:', file.size);
      toast.error('La imagen no debe superar los 5MB');
      return;
    }
    
    console.log('📝 Form - Setting imageFile state...');
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('📝 Form - Preview created, length:', result?.length);
      setImagePreview(result);
    };
    reader.onerror = (e) => {
      console.error('📝 Form - Error creating preview:', e);
    };
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const clearImage = () => {
    console.log('📝 Form - Clearing image...');
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  // Handle form submission
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('📝 Form - Form submission started with data:', data);
    console.log('📝 Form - Current imageFile state:', {
      hasFile: !!imageFile,
      fileName: imageFile?.name,
      fileType: imageFile?.type,
      fileSize: imageFile?.size
    });
    
    setIsLoading(true);
    try {
      // Ensure storage is initialized before uploading images
      console.log('📝 Form - Ensuring storage is initialized...');
      await initializeStorage();
      
      let imageUrl = item?.image_url;
      console.log('📝 Form - Current imageUrl:', imageUrl);
      
      // Upload image if a new one has been selected
      if (imageFile) {
        console.log('📝 Form - Starting image upload process...');
        console.log('📝 Form - File details before upload:', {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
          lastModified: imageFile.lastModified,
          constructor: imageFile.constructor.name
        });
        
        // Simulate progress of upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + 5;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 100);
        
        // Generate unique filename with proper extension
        const fileExtension = imageFile.name.split('.').pop() || 'jpg';
        const uniqueFileName = `${generateUUID()}.${fileExtension}`;
        console.log('📝 Form - Generated filename:', uniqueFileName);
        
        console.log('📝 Form - Calling uploadMenuItemImage...');
        const uploadResult = await uploadMenuItemImage(imageFile, uniqueFileName);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        console.log('📝 Form - Upload result:', uploadResult);
        
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
          console.log('📝 Form - Image uploaded successfully, new URL:', imageUrl);
        } else {
          console.error('📝 Form - Upload failed:', uploadResult.error);
          toast.error(`Error al procesar la imagen: ${uploadResult.error}`);
          setIsLoading(false);
          setUploadProgress(0);
          return;
        }
      } else {
        console.log('📝 Form - No new image to upload, keeping existing URL');
      }
      
      // Build item data for submission
      const itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> = {
        name: data.name,
        description: data.description || '',
        price: data.price,
        category_id: data.category_id,
        available: data.available,
        popular: data.popular,
        allergens: data.allergens || [],
        sku: data.sku,
        image_url: imageUrl,
      };
      
      console.log('📝 Form - Final item data for save:', {
        ...itemData,
        image_url: itemData.image_url ? 'URL presente' : 'Sin URL'
      });
      
      let success: boolean;
      
      // Create or update the menu item
      if (item) {
        console.log('📝 Form - Updating existing item with ID:', item.id);
        const updatedItem = await updateMenuItem(item.id, itemData);
        success = !!updatedItem;
        if (success) {
          console.log('📝 Form - Item updated successfully:', {
            id: updatedItem?.id,
            name: updatedItem?.name,
            hasImageUrl: !!updatedItem?.image_url
          });
        } else {
          console.error('📝 Form - Failed to update item');
        }
      } else {
        console.log('📝 Form - Creating new item...');
        const newItem = await createMenuItem(itemData);
        success = !!newItem;
        if (success) {
          console.log('📝 Form - Item created successfully:', {
            id: newItem?.id,
            name: newItem?.name,
            hasImageUrl: !!newItem?.image_url
          });
        } else {
          console.error('📝 Form - Failed to create item');
        }
      }
      
      if (success) {
        toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
        
        // Notify other components about the update
        console.log('📝 Form - Dispatching menuItemsUpdated event');
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        
        onClose(true);
      } else {
        toast.error(item ? 'Error al actualizar el elemento' : 'Error al crear el elemento');
      }
    } catch (error) {
      console.error('📝 Form - Error in form submission:', error);
      toast.error('Error al guardar el elemento');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
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
