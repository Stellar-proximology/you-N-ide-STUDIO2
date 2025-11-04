import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, X, FileCode, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { StoredZip } from "@shared/schema";

interface ZipPlayerProps {
  zip: StoredZip | null;
  open: boolean;
  onClose: () => void;
}

export function ZipPlayer({ zip, open, onClose }: ZipPlayerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const { data: entryFileData } = useQuery<{ entryFile: string | null }>({
    queryKey: ['/api/zips', zip?.id, 'entry-file'],
    enabled: !!zip && open,
  });

  useEffect(() => {
    if (entryFileData?.entryFile && !selectedFile) {
      setSelectedFile(entryFileData.entryFile);
    }
  }, [entryFileData, selectedFile]);

  const htmlFiles = zip?.structure.entries
    .filter(e => e.type === 'file' && (e.name.endsWith('.html') || e.name.endsWith('.htm')))
    .map(e => e.path) || [];

  // Detect Godot export by checking for .pck and .wasm files
  const isGodotExport = zip?.structure.entries.some(e => 
    e.type === 'file' && (e.name.endsWith('.pck') || e.name.endsWith('.wasm'))
  );

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const playerUrl = selectedFile ? `/api/zips/${zip?.id}/play/${selectedFile}` : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col" data-testid="dialog-player">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-primary" />
              <div>
                <DialogTitle>Zip Player</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {zip?.originalName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-player"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Entry File:</span>
          </div>
          
          <Select value={selectedFile || ''} onValueChange={setSelectedFile}>
            <SelectTrigger className="w-[300px]" data-testid="select-entry-file">
              <SelectValue placeholder="Select an HTML file" />
            </SelectTrigger>
            <SelectContent>
              {htmlFiles.map(file => (
                <SelectItem key={file} value={file} data-testid={`option-${file}`}>
                  {file}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {entryFileData?.entryFile && (
            <Badge variant="secondary" className="text-xs">
              Auto-detected
            </Badge>
          )}

          {isGodotExport && (
            <Badge variant="default" className="text-xs bg-primary">
              Godot Export
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="ml-auto"
            data-testid="button-refresh-player"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex-1 bg-muted rounded-lg overflow-hidden border">
          {selectedFile ? (
            <iframe
              key={iframeKey}
              src={playerUrl}
              className="w-full h-full bg-white"
              sandbox={
                isGodotExport 
                  ? "allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock" 
                  : "allow-scripts allow-same-origin allow-forms"
              }
              title="Zip Player Preview"
              data-testid="iframe-player"
              allow="cross-origin-isolated"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <FileCode className="w-12 h-12 mx-auto opacity-50" />
                <p>No HTML file selected</p>
                <p className="text-sm">Choose an entry file to preview the app</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
