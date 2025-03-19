
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, FileImage } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Per favore seleziona un file immagine');
      return;
    }
    
    setIsUploading(true);
    
    // For now, just create a local URL for the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setIsUploading(false);
      toast.success('Immagine caricata');
    };
    
    reader.onerror = () => {
      toast.error('Errore durante il caricamento dell\'immagine');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemove = () => {
    onChange('');
    toast.success('Immagine rimossa');
  };
  
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full h-32 border rounded-md overflow-hidden">
          <img 
            src={value} 
            alt="Uploaded logo" 
            className="w-full h-full object-contain" 
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md">
          <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Trascina un'immagine o clicca per caricare
          </p>
          <Button disabled={isUploading} asChild size="sm">
            <label>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Caricamento...' : 'Carica logo'}
              <input 
                type="file" 
                className="sr-only" 
                accept="image/*" 
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </Button>
        </div>
      )}
    </div>
  );
};
