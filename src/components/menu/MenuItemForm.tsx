
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
import { uploadMenuItemImage, initializeStorage } from '@/services/storage/imageStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ImagePlus, Loader2, Upload } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from '@/lib/utils';
import MenuItemImage from './MenuItemImage';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    if (item?.image_url) {
      setImagePreview(item.image_url);
    }
    
    // Inicializar eventos de drag & drop
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
      }
    };
    
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('dragenter', handleDragEnter);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('drop', handleDrop);
      
      return () => {
        dropZone.removeEventListener('dragenter', handleDragEnter);
        dropZone.removeEventListener('dragleave', handleDragLeave);
        dropZone.removeEventListener('dragover', handleDragOver);
        dropZone.removeEventListener('drop', handleDrop);
      };
    }
  }, [item, isDragging]);

  // Inicializar almacenamiento automáticamente al abrir el formulario
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
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
      // Asegurar que el almacenamiento está inicializado antes de subir imágenes
      await initializeStorage();
      
      let imageUrl = item?.image_url;
      
      // Subir imagen si se ha seleccionado una nueva
      if (imageFile) {
        // Simular progreso de carga
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + 5;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 100);
        
        const uploadResult = await uploadMenuItemImage(imageFile);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (typeof uploadResult === 'string') {
          imageUrl = uploadResult;
          console.log('📦 Imagen procesada correctamente');
        } else if (uploadResult && uploadResult.error) {
          toast.error(`Error al procesar la imagen: ${uploadResult.error}`);
          setIsLoading(false);
          setUploadProgress(0);
          return;
        } else if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          toast.error('Error al procesar la imagen');
          setIsLoading(false);
          setUploadProgress(0);
          return;
        }
      }
      
      // Construir datos del ítem
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
      
      // Crear o actualizar ítem
      if (item) {
        const updatedItem = await updateMenuItem(item.id, itemData);
        success = !!updatedItem;
      } else {
        const newItem = await createMenuItem(itemData);
        success = !!newItem;
      }
      
      if (success) {
        toast.success(item ? 'Elemento actualizado con éxito' : 'Elemento creado con éxito');
        
        // Notificar a otros componentes sobre la actualización de items
        window.dispatchEvent(new CustomEvent('menuItemsUpdated'));
        
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
      setUploadProgress(0);
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
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Precio (COP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1000" 
                          min="0" 
                          placeholder="Precio en pesos" 
                          value={value === undefined ? '' : value}
                          onChange={onChange}
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
                  <div 
                    ref={dropZoneRef}
                    className={cn(
                      "border-2 border-dashed rounded-md p-4 h-40 flex flex-col items-center justify-center relative transition-colors",
                      isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25",
                      imagePreview ? "bg-background" : "bg-muted/30"
                    )}
                  >
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-background/80 z-10 flex flex-col items-center justify-center">
                        <div className="w-full max-w-xs bg-muted rounded-full h-2.5 mb-2">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{`Subiendo... ${uploadProgress}%`}</p>
                      </div>
                    )}
                    
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <div className="w-full h-full relative">
                          <img 
                            src={imagePreview} 
                            alt="Vista previa" 
                            className="w-full h-full object-contain"
                          />
                          <button 
                            type="button"
                            onClick={clearImage}
                            className="absolute top-1 right-1 bg-destructive/90 hover:bg-destructive text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="flex flex-col items-center justify-center space-y-2 cursor-pointer w-full h-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isDragging ? (
                          <>
                            <Upload className="h-8 w-8 text-primary" />
                            <p className="text-sm text-primary">Suelte la imagen aquí</p>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground text-center">
                              Haga clic para cargar o arrastre una imagen aquí
                            </p>
                          </>
                        )}
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
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Formatos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB
                  </p>
                </div>
                
                <div className="space-y-4 mt-4">
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
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
