
import React, { useEffect } from 'react';
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
import { Loader2, RotateCcw } from 'lucide-react';
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
    resetForm,
  } = useMenuItemForm(item, handleClose);

  // Auto-reset cuando se abre el formulario
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Dialog opened, resetting form');
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Timeout absoluto de seguridad (15 segundos)
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.log('🚨 Emergency timeout triggered');
        resetForm();
      }, 15000);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, resetForm]);

  const handleDialogClose = (open: boolean) => {
    if (!open && !isLoading) {
      handleClose(false);
    }
  };

  const handleManualReset = () => {
    console.log('🔄 Manual reset triggered');
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            
            {/* Botón de reset manual */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleManualReset}
              disabled={isLoading}
              className="ml-auto"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para {item ? 'actualizar' : 'crear'} un producto del menú.
            {isLoading && (
              <span className="text-yellow-600 block mt-1">
                ⏳ Procesando... (máximo 15 segundos)
              </span>
            )}
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
                type="button" 
                variant="secondary" 
                onClick={handleManualReset}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
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
