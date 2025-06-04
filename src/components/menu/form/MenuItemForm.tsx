
import React from 'react';
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
import { useMenuFormDialog } from './useMenuFormDialog';
import { ImageUploader } from './ImageUploader';
import { AvailabilityControls } from './AvailabilityControls';
import { BasicFields, CategoryField } from './FormFields';

interface MenuItemFormProps {
  item: MenuItem | null;
  categories: MenuCategory[];
  onClose: (saved: boolean) => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, categories, onClose }) => {
  const { isOpen, handleClose } = useMenuFormDialog(onClose);
  
  const {
    form,
    isLoading,
    imagePreview,
    handleFileSelection,
    clearImage,
    onSubmit,
  } = useMenuItemForm(item, handleClose);

  const handleDialogClose = (open: boolean) => {
    if (!open && !isLoading) {
      handleClose(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para {item ? 'actualizar' : 'crear'} un producto del menú.
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
                  onFileSelected={handleFileSelection}
                  onClearImage={clearImage}
                />
                
                <AvailabilityControls form={form} />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleClose(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Guardando...' : (item ? 'Actualizar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
