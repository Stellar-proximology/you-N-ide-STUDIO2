import { useState, useMemo } from "react";
import { X, AlertTriangle, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { StoredZip, StitchConflict } from "@shared/schema";

interface StitchingWorkspaceProps {
  selectedZips: StoredZip[];
  onRemoveZip: (zipId: string) => void;
  onStitch: (conflictResolutions: Record<string, 'first' | 'last' | 'rename'>) => void;
  onClose: () => void;
}

export function StitchingWorkspace({ selectedZips, onRemoveZip, onStitch, onClose }: StitchingWorkspaceProps) {
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, 'first' | 'last' | 'rename'>>({});

  const conflicts = useMemo(() => {
    const pathMap = new Map<string, string[]>();
    
    selectedZips.forEach(zip => {
      zip.structure.entries.forEach(entry => {
        if (!entry.isDirectory) {
          const sources = pathMap.get(entry.path) || [];
          sources.push(zip.originalName);
          pathMap.set(entry.path, sources);
        }
      });
    });

    const conflictList: StitchConflict[] = [];
    pathMap.forEach((sources, path) => {
      if (sources.length > 1) {
        conflictList.push({ path, sources });
      }
    });

    return conflictList;
  }, [selectedZips]);

  const totalFiles = useMemo(() => {
    const uniquePaths = new Set<string>();
    selectedZips.forEach(zip => {
      zip.structure.entries.forEach(entry => {
        if (!entry.isDirectory) {
          uniquePaths.add(entry.path);
        }
      });
    });
    
    let additionalRenamedFiles = 0;
    conflicts.forEach(conflict => {
      if (conflictResolutions[conflict.path] === 'rename') {
        additionalRenamedFiles += conflict.sources.length - 1;
      }
    });
    
    return uniquePaths.size + additionalRenamedFiles;
  }, [selectedZips, conflicts, conflictResolutions]);

  const handleConflictResolution = (path: string, resolution: 'first' | 'last' | 'rename') => {
    setConflictResolutions(prev => ({ ...prev, [path]: resolution }));
  };

  const handleStitch = () => {
    const resolutions = { ...conflictResolutions };
    conflicts.forEach(conflict => {
      if (!resolutions[conflict.path]) {
        resolutions[conflict.path] = 'first';
      }
    });
    onStitch(resolutions);
  };

  if (selectedZips.length === 0) {
    return (
      <Card className="border-dashed" data-testid="stitch-empty">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">No Zips Selected</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Select at least 2 zip files from your archive to start stitching them together
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="stitch-workspace">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Selected Zips ({selectedZips.length})</span>
            <Button size="sm" variant="ghost" onClick={onClose} data-testid="button-close-stitch">
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {selectedZips.map((zip, index) => (
                <div
                  key={zip.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover-elevate"
                  data-testid={`selected-zip-${zip.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      <p className="text-sm font-medium text-foreground truncate">{zip.originalName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {zip.structure.fileCount} files
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveZip(zip.id)}
                    data-testid={`button-remove-${zip.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Preview & Conflicts</span>
            {conflicts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {conflicts.length} conflicts
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated total files:</span>
                <span className="font-semibold text-foreground">{totalFiles}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">File conflicts:</span>
                <span className={`font-semibold ${conflicts.length > 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {conflicts.length}
                </span>
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  Resolve Conflicts
                </div>

                <ScrollArea className="h-64">
                  <Accordion type="single" collapsible className="space-y-2">
                    {conflicts.map((conflict, index) => (
                      <AccordionItem
                        key={conflict.path}
                        value={conflict.path}
                        className="border rounded-lg px-3"
                      >
                        <AccordionTrigger className="text-sm hover:no-underline py-3">
                          <div className="flex items-center gap-2 text-left">
                            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                            <span className="truncate font-mono text-xs">{conflict.path}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <RadioGroup
                            value={conflictResolutions[conflict.path] || 'first'}
                            onValueChange={(value) => handleConflictResolution(conflict.path, value as any)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="first" id={`${conflict.path}-first`} />
                                <Label htmlFor={`${conflict.path}-first`} className="text-sm cursor-pointer">
                                  Keep from <span className="font-medium">{conflict.sources[0]}</span>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="last" id={`${conflict.path}-last`} />
                                <Label htmlFor={`${conflict.path}-last`} className="text-sm cursor-pointer">
                                  Keep from <span className="font-medium">{conflict.sources[conflict.sources.length - 1]}</span>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="rename" id={`${conflict.path}-rename`} />
                                <Label htmlFor={`${conflict.path}-rename`} className="text-sm cursor-pointer">
                                  Keep both (rename duplicates)
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </div>
            )}

            <Button
              className="w-full"
              size="default"
              onClick={handleStitch}
              disabled={selectedZips.length < 2}
              data-testid="button-create-merged"
            >
              <Download className="w-4 h-4 mr-2" />
              Create Merged Zip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
