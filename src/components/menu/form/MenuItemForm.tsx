
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { MenuItem } from '@/services/menu/menuItemTypes';
import { MenuCategory } from '@/services/menu/categoryService';
import { useMenuItemForm } from './useMenuItemForm';
import { ImageUploader } from './ImageUploader';
import { AvailabilityControls } from './AvailabilityControls';
import { BasicFields, CategoryField } from './FormFields';

interface MenuItemFormProps {
  item: MenuItem | null;
  categories: MenuCategory[];
  onClose: (saved: boolean) => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, categories, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const {
    form,
    isLoading,
    imagePreview,
    uploadProgress,
    handleFileSelection,
    clearImage,
    onSubmit
  } = useMenuItemForm(item, onClose);

  const handleClose = () => {
    setIsOpen(false);
    onClose(false);
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
                <BasicFields form={form} categories={categories} />
              </div>
              
              <div className="space-y-4">
                <CategoryField form={form} categories={categories} />
                
                <ImageUploader
                  imagePreview={imagePreview}
                  uploadProgress={uploadProgress}
                  onFileSelected={handleFileSelection}
                  onClearImage={clearImage}
                />
                
                <AvailabilityControls form={form} />
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

export { MenuItemForm };
