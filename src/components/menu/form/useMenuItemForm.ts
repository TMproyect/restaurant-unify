
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
      setImagePreview(item.image_url);
    }
  }, [item]);

  // Initialize storage on form load
  useEffect(() => {
    const ensureStorageInitialized = async () => {
      try {
        await initializeStorage();
      } catch (error) {
        console.error("Error al inicializar almacenamiento:", error);
      }
    };
    
    ensureStorageInitialized();
  }, []);

  // Handle image selection
  const handleFileSelection = (file: File) => {
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  // Handle form submission
  const onSubmit = async (data: MenuItemFormValues) => {
    setIsLoading(true);
    try {
      // Ensure storage is initialized before uploading images
      await initializeStorage();
      
      let imageUrl = item?.image_url;
      
      // Upload image if a new one has been selected
      if (imageFile) {
        // Simulate progress of upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + 5;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 100);
        
        // Generate filename with timestamp
        const fileName = `menu-item-${Date.now()}-${imageFile.name}`;
        const uploadResult = await uploadMenuItemImage(imageFile, fileName);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
          console.log('📦 Imagen procesada correctamente:', imageUrl);
        } else if (uploadResult.error) {
          toast.error(`Error al procesar la imagen: ${uploadResult.error}`);
          setIsLoading(false);
          setUploadProgress(0);
          return;
        } else {
          toast.error('Error al procesar la imagen');
          setIsLoading(false);
          setUploadProgress(0);
          return;
        }
      }
      
      // Build item data for submission - now with processed URL
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
      
      let success: boolean;
      
      // Create or update the menu item - services no longer process images
      if (item) {
        const updatedItem = await updateMenuItem(item.id, itemData);
        success = !!updatedItem;
        if (success) {
          console.log('✅ Item actualizado exitosamente:', updatedItem);
        }
      } else {
        const newItem = await createMenuItem(itemData);
        success = !!newItem;
        if (success) {
          console.log('✅ Item creado exitosamente:', newItem);
        }
      }
      
      if (success) {
        toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
        
        // Notify other components about the update
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        
        onClose(true);
      } else {
        toast.error(item ? 'Error al actualizar el elemento' : 'Error al crear el elemento');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
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
