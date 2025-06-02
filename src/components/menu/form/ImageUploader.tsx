
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ImagePlus, Upload, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploaderProps {
  imagePreview: string | null;
  onFileSelected: (file: File) => void;
  onClearImage: () => void;
  isUploading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreview,
  onFileSelected,
  onClearImage,
  isUploading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };
  
  // Handle drop zone events
  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        onFileSelected(file);
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
  }, [onFileSelected]);

  return (
    <div className="space-y-2">
      <Label>Imagen</Label>
      <div 
        ref={dropZoneRef}
        className={cn(
          "border-2 border-dashed rounded-md p-4 h-40 flex flex-col items-center justify-center relative transition-colors",
          isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25",
          imagePreview ? "bg-background" : "bg-muted/30",
          isUploading && "opacity-60 pointer-events-none"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-primary">Subiendo imagen...</p>
          </div>
        ) : imagePreview ? (
          <div className="relative w-full h-full">
            <img 
              src={imagePreview} 
              alt="Vista previa" 
              className="w-full h-full object-contain"
            />
            <button 
              type="button"
              onClick={onClearImage}
              className="absolute top-1 right-1 bg-destructive/90 hover:bg-destructive text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
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
  );
};

export { ImageUploader };
