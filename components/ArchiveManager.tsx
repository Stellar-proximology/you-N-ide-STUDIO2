import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Archive, 
  X, 
  Trash2, 
  Eye, 
  Edit2, 
  Save, 
  FolderOpen,
  FileText,
  Check,
  XCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StoredZip, ZipFileEntry } from "@shared/schema";

interface ArchiveManagerProps {
  zip: StoredZip | null;
  open: boolean;
  onClose: () => void;
}

export function ArchiveManager({ zip, open, onClose }: ArchiveManagerProps) {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [renames, setRenames] = useState<Map<string, string>>(new Map());
  const [viewingFile, setViewingFile] = useState<{ path: string; content: string } | null>(null);
  const { toast } = useToast();

  const modifyMutation = useMutation({
    mutationFn: async () => {
      const deletedPaths = Array.from(selectedPaths);
      const renamedPaths = Array.from(renames.entries()).map(([oldPath, newPath]) => ({
        oldPath,
        newPath,
      }));

      return await apiRequest('POST', `/api/zips/${zip?.id}/modify`, {
        deletedPaths,
        renamedPaths,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zips'] });
      toast({
        title: "Archive modified",
        description: "A new zip has been created with your changes.",
      });
      setSelectedPaths(new Set());
      setRenames(new Map());
      onClose();
    },
    onError: () => {
      toast({
        title: "Modification failed",
        description: "Failed to create modified archive. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleSelect = (path: string) => {
    setSelectedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleStartRename = (path: string) => {
    setRenamingPath(path);
    setNewName(renames.get(path) || path.split('/').pop() || '');
  };

  const handleSaveRename = () => {
    if (renamingPath && newName) {
      const dir = renamingPath.split('/').slice(0, -1).join('/');
      const fullNewPath = dir ? `${dir}/${newName}` : newName;
      
      setRenames(prev => new Map(prev).set(renamingPath, fullNewPath));
      setRenamingPath(null);
      setNewName("");
    }
  };

  const handleCancelRename = () => {
    setRenamingPath(null);
    setNewName("");
  };

  const handleViewFile = async (path: string) => {
    try {
      const response = await fetch(`/api/zips/${zip?.id}/file/${path}`);
      const text = await response.text();
      setViewingFile({ path, content: text });
    } catch (error) {
      toast({
        title: "Failed to load file",
        description: "Could not load file content.",
        variant: "destructive",
      });
    }
  };

  const files = zip?.structure.entries.filter(e => e.type === 'file') || [];
  const hasModifications = selectedPaths.size > 0 || renames.size > 0;

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <>
      <Dialog open={open && !viewingFile} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col" data-testid="dialog-archive-manager">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-primary" />
                <div>
                  <DialogTitle>Archive Manager</DialogTitle>
                  <DialogDescription className="mt-1">
                    {zip?.originalName} - {files.length} files
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="button-close-manager"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex items-center gap-3 pb-4 border-b">
            {selectedPaths.size > 0 && (
              <Badge variant="destructive" className="text-xs">
                {selectedPaths.size} marked for deletion
              </Badge>
            )}
            {renames.size > 0 && (
              <Badge variant="secondary" className="text-xs">
                {renames.size} renamed
              </Badge>
            )}
            {hasModifications && (
              <Button
                size="sm"
                onClick={() => modifyMutation.mutate()}
                disabled={modifyMutation.isPending}
                className="ml-auto"
                data-testid="button-save-modifications"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as New Zip
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1 pr-4">
              {files.map((file) => {
                const isDeleted = selectedPaths.has(file.path);
                const newPath = renames.get(file.path);
                const isRenaming = renamingPath === file.path;
                const displayPath = newPath || file.path;

                return (
                  <div
                    key={file.path}
                    className={`flex items-center gap-3 p-2 rounded-md border ${
                      isDeleted ? 'opacity-50 bg-destructive/10 border-destructive/20' : 'hover-elevate'
                    }`}
                    data-testid={`file-${file.path}`}
                  >
                    <Checkbox
                      checked={isDeleted}
                      onCheckedChange={() => handleToggleSelect(file.path)}
                      data-testid={`checkbox-delete-${file.path}`}
                    />

                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                    {isRenaming ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          className="flex-1"
                          autoFocus
                          data-testid="input-rename"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveRename}
                          data-testid="button-confirm-rename"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelRename}
                          data-testid="button-cancel-rename"
                        >
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${newPath ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {displayPath}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(file.size)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewFile(file.path)}
                            disabled={isDeleted}
                            data-testid={`button-view-${file.path}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartRename(file.path)}
                            disabled={isDeleted}
                            data-testid={`button-rename-${file.path}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {viewingFile && (
        <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
          <DialogContent className="max-w-4xl h-[85vh] flex flex-col" data-testid="dialog-file-viewer">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {viewingFile.path}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1">
              <pre className="text-sm p-4 bg-muted rounded-md overflow-x-auto">
                <code>{viewingFile.content}</code>
              </pre>
            </ScrollArea>
            <div className="flex justify-end">
              <Button onClick={() => setViewingFile(null)} data-testid="button-close-viewer">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
