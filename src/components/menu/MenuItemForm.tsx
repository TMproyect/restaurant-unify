
import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { MenuCategory } from '@/services/menu/categoryService';
import { MenuItem, createMenuItem, updateMenuItem } from '@/services/menu/menuItemService';
import { uploadMenuItemImage } from '@/services/storage/imageStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define schema for menu item form
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo" }),
  category_id: z.string().min(1, { message: "Seleccione una categoría" }),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  allergens: z.array(z.string()).optional(),
  sku: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MenuItemFormProps {
  item: MenuItem | null;
  categories: MenuCategory[];
  onClose: (saved: boolean) => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, categories, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize the form with default values or item values if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

  // Set image preview if item has an image
  useEffect(() => {
    if (item?.image_url) {
      setImagePreview(item.image_url);
    }
  }, [item]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }
    
    // Log the detected file type
    console.log('📦 Archivo seleccionado con tipo:', file.type);
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose(false);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = item?.image_url;
      
      // Upload image if a new one was selected
      if (imageFile) {
        // Verificación extra del tipo de archivo antes de subir
        console.log('📦 Verificando tipo de archivo antes de subir:', imageFile.type);
        
        // Comprobamos una vez más que sea una imagen válida
        if (!imageFile.type.match('image.*')) {
          toast.error('El archivo seleccionado no es una imagen válida');
          setIsLoading(false);
          return;
        }
        
        const fileName = `menu_${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const uploadResult = await uploadMenuItemImage(imageFile, fileName);
        
        if (typeof uploadResult === 'string') {
          imageUrl = uploadResult;
          console.log('📦 Imagen subida correctamente, URL:', imageUrl);
        } else if (uploadResult && uploadResult.error) {
          toast.error(`Error al subir la imagen: ${uploadResult.error}`);
          setIsLoading(false);
          return;
        } else if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
          console.log('📦 Imagen subida correctamente, URL:', imageUrl);
        } else {
          toast.error('Error al subir la imagen');
          setIsLoading(false);
          return;
        }
      }
      
      // Prepare item data with required fields
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
      
      // Create or update item
      if (item) {
        // Update existing item
        const updatedItem = await updateMenuItem(item.id, itemData);
        success = !!updatedItem;
      } else {
        // Create new item
        const newItem = await createMenuItem(itemData);
        success = !!newItem;
      }
      
      if (success) {
        toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
        setIsOpen(false);
        onClose(true);
      } else {
        toast.error(item ? 'Error al actualizar el elemento' : 'Error al crear el elemento');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Error al guardar el elemento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Plato' : 'Añadir Nuevo Plato'}
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para {item ? 'actualizar' : 'crear'} un plato del menú.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del plato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción del plato" 
                          className="resize-none" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Código único (opcional)" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label>Imagen</Label>
                  <div className="border-2 border-dashed rounded-md p-4 h-40 flex flex-col items-center justify-center relative">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={imagePreview} 
                          alt="Vista previa" 
                          className="w-full h-full object-contain"
                        />
                        <button 
                          type="button"
                          onClick={clearImage}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex flex-col items-center justify-center space-y-2 cursor-pointer w-full h-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Haga clic para cargar una imagen</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Disponible</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="popular"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Popular</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {item ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemForm;
