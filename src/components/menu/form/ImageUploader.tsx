
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ImagePlus, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploaderProps {
  imagePreview: string | null;
  uploadProgress: number;
  onFileSelected: (file: File) => void;
  onClearImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreview,
  uploadProgress,
  onFileSelected,
  onClearImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('🖼️ ImageUploader - File selected from input:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      // Validate file type and size before passing
      if (!file.type.startsWith('image/')) {
        console.error('🖼️ ImageUploader - Invalid file type:', file.type);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        console.error('🖼️ ImageUploader - File too large:', file.size);
        return;
      }
      
      // Pass the file object directly without any modification
      onFileSelected(file);
    }
  };
  
  // Handle drop zone events
  React.useEffect(() => {
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
        console.log('🖼️ ImageUploader - File dropped:', {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        });
        
        // Validate file type and size before passing
        if (!file.type.startsWith('image/')) {
          console.error('🖼️ ImageUploader - Invalid dropped file type:', file.type);
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          console.error('🖼️ ImageUploader - Dropped file too large:', file.size);
          return;
        }
        
        // Pass the file object directly without any modification
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
  }, [isDragging, onFileSelected]);

  return (
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
                onClick={onClearImage}
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
  );
};

export { ImageUploader };
