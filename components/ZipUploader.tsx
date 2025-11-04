import { useState, useCallback } from "react";
import { Upload, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ZipUploaderProps {
  onUploadComplete: (zipId: string) => void;
}

export function ZipUploader({ onUploadComplete }: ZipUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(f => f.name.endsWith('.zip'));
    
    if (!zipFile) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a .zip file",
      });
      return;
    }

    await handleFileUpload(zipFile);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProgress(10);

    try {
      const response = await fetch('/api/zips/upload-url', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to get upload URL');
      
      const { uploadURL } = await response.json();
      setProgress(30);

      await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/zip',
        },
      });
      setProgress(60);

      const createResponse = await fetch('/api/zips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          objectPath: uploadURL,
          size: file.size,
        }),
      });

      if (!createResponse.ok) throw new Error('Failed to create zip record');
      
      const { id } = await createResponse.json();
      setProgress(100);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded and is being analyzed.`,
      });

      onUploadComplete(id);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg min-h-64 
          flex flex-col items-center justify-center gap-4 p-8
          transition-all duration-150
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover-elevate'}
          ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
        data-testid="upload-zone"
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
          data-testid="input-file"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            {uploading ? (
              <Cloud className="w-8 h-8 text-muted-foreground animate-pulse" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-base font-semibold text-foreground">
              {uploading ? 'Uploading...' : 'Drop your zip file here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary font-medium">browse files</span>
            </p>
          </div>
        </div>

        {!uploading && (
          <Button size="default" variant="outline" className="mt-2" data-testid="button-browse">
            Browse Files
          </Button>
        )}
      </div>

      {uploading && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" data-testid="progress-upload" />
          <p className="text-xs text-muted-foreground text-center">
            {progress < 30 ? 'Preparing upload...' : progress < 60 ? 'Uploading to storage...' : 'Finalizing...'}
          </p>
        </div>
      )}
    </div>
  );
}
