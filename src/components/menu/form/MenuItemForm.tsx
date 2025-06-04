
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
import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
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
  console.log('🔄 MenuItemForm: Rendering with item:', item?.name || 'NEW');
  
  const { isOpen, handleClose } = useMenuFormDialog(onClose);
  
  const {
    form,
    isLoading,
    isUploadingImage,
    imagePreview,
    handleFileSelection,
    clearImage,
    onSubmit,
    emergencyReset
  } = useMenuItemForm(item, (saved) => {
    console.log('🔄 MenuItemForm: useMenuItemForm callback called with saved:', saved);
    handleClose(saved);
  });

  const isProcessing = isLoading || isUploadingImage;

  const handleDialogClose = (open: boolean) => {
    console.log('🔄 MenuItemForm: Dialog close requested, open:', open);
    if (!open && !isProcessing) {
      console.log('🔄 MenuItemForm: Allowing dialog close');
      handleClose(false);
    } else if (!open && isProcessing) {
      console.log('🔄 MenuItemForm: Blocking dialog close - processing in progress');
    }
  };

  const handleCancel = () => {
    console.log('🔄 MenuItemForm: Cancel button clicked');
    if (!isProcessing) {
      handleClose(false);
    }
  };

  const handleEmergencyExit = () => {
    console.log('🚨 MenuItemForm: Emergency exit triggered');
    emergencyReset();
    handleClose(false);
  };

  const handleFormSubmit = (data: any) => {
    console.log('🔄 MenuItemForm: Form submit triggered');
    onSubmit(data);
  };

  console.log('🔄 MenuItemForm: Render state:', {
    isOpen,
    isLoading,
    isUploadingImage,
    isProcessing,
    hasImagePreview: !!imagePreview
  });

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
        
        {/* Indicador de estado mejorado */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">
                  {isUploadingImage 
                    ? 'Subiendo imagen... (puede tardar hasta 60 segundos)' 
                    : 'Guardando producto...'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={emergencyReset}
                  className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Resetear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEmergencyExit}
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Salir Forzado
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  isUploading={isUploadingImage}
                />
                
                <AvailabilityControls form={form} />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing} 
                className="gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUploadingImage ? 'Subiendo imagen...' : 
                 isLoading ? 'Guardando...' : 
                 (item ? 'Actualizar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
