
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
      onFileSelected(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <Label>Imagen</Label>
      <div className="border-2 border-dashed rounded-md p-4 h-40 flex flex-col items-center justify-center relative border-muted-foreground/25">
        {imagePreview ? (
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
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Haga clic para cargar una imagen
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
