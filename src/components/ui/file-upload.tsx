'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface FileUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5,
  accept = 'image/*',
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.url;
  };

  const handleFiles = async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (value.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate files
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Maximum size is ${maxSize}MB`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not a valid image`);
        return;
      }
    }

    setUploading(true);
    
    try {
      const uploadPromises = fileArray.map(uploadFile);
      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls]);
      toast.success(`${urls.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    if (disabled) return;
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
    toast.success('File removed');
  };

  const openFileSelector = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragging && !disabled
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          
          <div className="text-sm">
            {uploading ? (
              <p>Uploading files...</p>
            ) : (
              <>
                <p className="font-medium">
                  Drop files here or click to upload
                </p>
                <p className="text-muted-foreground">
                  Maximum {maxFiles} files, {maxSize}MB each
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File Preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
              
              {!disabled && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              {/* File indicator */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File count info */}
      {value.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {value.length} of {maxFiles} files uploaded
        </p>
      )}
    </div>
  );
}