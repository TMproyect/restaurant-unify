
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { menuItemFormSchema, MenuItemFormValues } from './schemas/menuItemFormSchema';
import { createMenuItem, updateMenuItem } from '@/services/menu/menuItemMutations';
import { uploadMenuItemImage } from '@/services/storage/operations/imageUpload';

export type { MenuItemFormValues } from './schemas/menuItemFormSchema';

// Timeout absoluto para operaciones
const OPERATION_TIMEOUT = 10000; // 10 segundos

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

  // Resetear completamente el formulario y estados
  const resetForm = () => {
    console.log('🔄 Resetting form completely');
    setIsLoading(false);
    setImageFile(null);
    setImagePreview(item?.image_url || null);
    form.reset();
  };

  // Timeout absoluto para cualquier operación
  const withTimeout = <T>(promise: Promise<T>, timeoutMs = OPERATION_TIMEOUT): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operación cancelada por timeout (${timeoutMs}ms)`));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };

  const handleFileSelection = (file: File) => {
    console.log('📁 File selected:', file.name);
    setImageFile(file);
    
    // Preview inmediato
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
      // PASO 1: Crear o actualizar el producto SIN imagen primero
      console.log('📦 Creating/updating product without image...');
      
      const productData = {
        name: data.name,
        description: data.description || '',
        price: data.price,
        category_id: data.category_id,
        available: data.available,
        popular: data.popular,
        allergens: data.allergens || [],
        sku: data.sku || '',
        image_url: item?.image_url || null, // Mantener imagen existente si es edición
      };

      let productResult;
      if (item) {
        productResult = await withTimeout(updateMenuItem(item.id, productData));
        console.log('✅ Product updated successfully');
      } else {
        productResult = await withTimeout(createMenuItem(productData));
        console.log('✅ Product created successfully');
      }

      if (!productResult) {
        throw new Error('No se pudo crear/actualizar el producto');
      }

      // PASO 2: Si hay una nueva imagen, intentar subirla (OPCIONAL)
      if (imageFile && productResult) {
        console.log('🖼️ Uploading new image...');
        
        try {
          const uploadResult = await withTimeout(
            uploadMenuItemImage(imageFile), 
            5000 // Solo 5 segundos para la imagen
          );
          
          if (uploadResult.success && uploadResult.imageUrl) {
            // PASO 3: Actualizar el producto con la nueva URL de imagen
            console.log('🔄 Updating product with image URL...');
            const updateData = { ...productData, image_url: uploadResult.imageUrl };
            
            if (item) {
              await withTimeout(updateMenuItem(item.id, updateData));
            } else if (productResult.id) {
              await withTimeout(updateMenuItem(productResult.id, updateData));
            }
            
            console.log('✅ Product updated with image');
          } else {
            console.warn('⚠️ Image upload failed, but product was created/updated');
            toast.warning('Producto guardado, pero no se pudo subir la imagen');
          }
        } catch (imageError) {
          console.warn('⚠️ Image upload failed:', imageError);
          toast.warning('Producto guardado, pero falló la subida de imagen');
        }
      }

      // Éxito total
      toast.success(item ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
      
      // Actualizar lista y cerrar
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      onClose(true);

    } catch (error) {
      console.error('❌ Error in submit:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Operación cancelada por timeout. Intenta de nuevo.');
      } else {
        toast.error('Error al guardar el producto. Intenta de nuevo.');
      }
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
    resetForm, // Exportar función de reset
  };
};
