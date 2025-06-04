
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { ImagePlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploaderProps {
  imagePreview: string | null;
  onFileSelected: (file: File) => void;
  onClearImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreview,
  onFileSelected,
  onClearImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      console.log('📁 File selected in uploader:', file.name, file.size);
      onFileSelected(file);
    } else if (file) {
      console.warn('⚠️ Invalid file type:', file.type);
    }
    // Limpiar input para permitir seleccionar el mismo archivo
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      console.log('📁 File dropped:', file.name, file.size);
      onFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-2">
      <Label>Imagen (Opcional)</Label>
      <div 
        className="border-2 border-dashed rounded-md p-4 h-40 flex flex-col items-center justify-center relative border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !imagePreview && fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <div className="relative w-full h-full">
            <img 
              src={imagePreview} 
              alt="Vista previa" 
              className="w-full h-full object-contain rounded"
            />
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearImage();
              }}
              className="absolute top-1 right-1 bg-destructive/90 hover:bg-destructive text-white p-1 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Botón para cambiar imagen */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute bottom-1 right-1 bg-primary/90 hover:bg-primary text-white p-1 rounded-full transition-colors"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full h-full">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Haga clic o arrastre una imagen aquí
            </p>
            <p className="text-xs text-muted-foreground">
              La imagen es opcional
            </p>
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
  );
};

export { ImageUploader };
