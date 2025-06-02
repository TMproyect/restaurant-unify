
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

  // Manejo de selección de archivo con validación estricta
  const handleFileSelection = async (file: File) => {
    console.log('🔄 handleFileSelection recibió archivo:', {
      name: file.name,
      type: file.type,
      size: file.size,
      isFile: file instanceof File
    });

    // Validación estricta adicional (por seguridad, aunque ImageUploader ya validó)
    const validatedFile = validateSelectedFile(file);
    if (!validatedFile) {
      console.error('❌ Archivo no pasó la validación en handleFileSelection');
      return;
    }

    setImageFile(validatedFile);

    // Create preview immediately con el archivo validado
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('✅ Vista previa creada, longitud:', result?.length);
      setImagePreview(result);
    };
    reader.onerror = (e) => {
      console.error('❌ Error creando vista previa:', e);
      toast.error('Error al crear vista previa de la imagen');
    };
    reader.readAsDataURL(validatedFile);
  };

  // Clear image completely
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(item?.image_url || null);
  };

  // Upload simplificado a Supabase sin contentType explícito
  const uploadImageToSupabase = async (fileToUpload: File): Promise<string | null> => {
    try {
      console.log('📤 Iniciando uploadImageToSupabase...');

      // Validación de seguridad adicional del File object
      if (!(fileToUpload instanceof File)) {
        console.error('🚨 CRÍTICO (upload): Se intentó subir algo que no es un File object validado.', fileToUpload);
        throw new Error("Intento de subir un objeto de archivo inválido.");
      }

      // Generar nombre único preservando la extensión
      const uniqueFileName = generateUniqueFileName(fileToUpload.name);
      const filePath = `menu/${uniqueFileName}`;

      // Configurar opciones de upload SIN contentType explícito
      const uploadOptions = {
        cacheControl: '3600',
        upsert: false
        // ¡REMOVIDO! contentType - dejar que Supabase lo detecte automáticamente
      };

      console.log(`--- Iniciando subida a Supabase ---
        Ruta: ${filePath}
        Archivo: ${fileToUpload.name} (Tamaño: ${fileToUpload.size}, Tipo: ${fileToUpload.type})
        Opciones: ${JSON.stringify(uploadOptions)}
        File object details: ${JSON.stringify({
          name: fileToUpload.name,
          type: fileToUpload.type,
          size: fileToUpload.size,
          lastModified: fileToUpload.lastModified,
          constructor: fileToUpload.constructor.name
        })}`);

      const { data, error } = await supabase.storage
        .from('menu_images')
        .upload(filePath, fileToUpload, uploadOptions);

      if (error) {
        console.error('❌ Error detallado de Supabase Storage al subir:', JSON.stringify(error, null, 2));
        throw new Error(`Error al subir imagen a Supabase: ${error.message}`);
      }

      if (!data?.path) {
        console.error('❌ No se recibió la ruta del archivo subido, data:', data);
        throw new Error('No se pudo obtener la ruta del archivo subido');
      }

      console.log('✅ Subida a Supabase exitosa:', data);

      // Obtener la URL pública usando la ruta devuelta por la subida
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

  // Simple form submission with immediate dialog close and refresh
  const onSubmit = async (data: MenuItemFormValues) => {
    console.log('🔄 Iniciando guardado de elemento del menú');
    setIsLoading(true);
    
    try {
      let imageUrl = item?.image_url;

      // Upload image if new file selected
      if (imageFile) {
        setIsUploadingImage(true);
        console.log('🖼️ Subiendo nueva imagen...');
        imageUrl = await uploadImageToSupabase(imageFile);
        
        if (!imageUrl) {
          throw new Error('No se pudo obtener la URL de la imagen subida');
        }
        
        console.log('✅ Imagen procesada correctamente:', imageUrl.substring(0, 50) + '...');
        setIsUploadingImage(false);
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
      
      // Trigger refresh immediately
      console.log('🔄 Disparando evento de actualización');
      window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
      
      // Force immediate dialog close with saved=true
      console.log('🔄 Cerrando diálogo inmediatamente');
      onClose(true);
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
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
