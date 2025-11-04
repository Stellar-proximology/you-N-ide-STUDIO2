import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Play, Combine, Upload, ArrowLeft, Package } from "lucide-react";
import { ZipUploader } from "@/components/ZipUploader";
import { ArchiveManager } from "@/components/ArchiveManager";
import { ZipPlayer } from "@/components/ZipPlayer";
import { StitchingWorkspace } from "@/components/StitchingWorkspace";
import type { StoredZip } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ZipManager() {
  const [, setLocation] = useLocation();
  const [selectedZip, setSelectedZip] = useState<StoredZip | null>(null);
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [showZipPlayer, setShowZipPlayer] = useState(false);
  const [selectedZipsForStitch, setSelectedZipsForStitch] = useState<StoredZip[]>([]);
  const { toast } = useToast();

  const { data: zips = [], isLoading } = useQuery<StoredZip[]>({
    queryKey: ['/api/zips'],
  });

  const handleManageZip = (zip: StoredZip) => {
    setSelectedZip(zip);
    setShowArchiveManager(true);
  };

  const handlePlayZip = (zip: StoredZip) => {
    setSelectedZip(zip);
    setShowZipPlayer(true);
  };

  const handleToggleStitchSelection = (zip: StoredZip) => {
    setSelectedZipsForStitch(prev => {
      const exists = prev.find(z => z.id === zip.id);
      if (exists) {
        return prev.filter(z => z.id !== zip.id);
      }
      return [...prev, zip];
    });
  };

  const handleStitch = async (conflictResolutions: Record<string, 'first' | 'last' | 'rename'>) => {
    try {
      const result = await apiRequest('POST', '/api/zips/merge', {
        zipIds: selectedZipsForStitch.map(z => z.id),
        conflictResolutions
      }) as any;

      toast({
        title: "Zips Stitched!",
        description: `Created merged archive with ${result.fileCount || 0} files`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/zips'] });
      setSelectedZipsForStitch([]);
    } catch (error) {
      toast({
        title: "Stitching Failed",
        description: "Could not merge archives. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadComplete = (zipId: string) => {
    queryClient.invalidateQueries({ queryKey: ['/api/zips'] });
    toast({
      title: "Upload Complete",
      description: "Your archive is ready to use",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="h-8 w-8 text-lavender" />
                ZIP Archive Manager
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload, manage, play, and stitch ZIP archives
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="archives" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md" data-testid="tabs-zip-manager">
            <TabsTrigger value="archives" data-testid="tab-archives">
              <Archive className="h-4 w-4 mr-2" />
              Archives
            </TabsTrigger>
            <TabsTrigger value="upload" data-testid="tab-upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="stitch" data-testid="tab-stitch">
              <Combine className="h-4 w-4 mr-2" />
              Stitch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="archives" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">Loading archives...</p>
                </CardContent>
              </Card>
            ) : zips.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Archives Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Upload your first ZIP archive to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zips.map((zip) => (
                  <Card
                    key={zip.id}
                    className="hover-elevate cursor-pointer transition-all"
                    data-testid={`card-zip-${zip.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg truncate flex items-center gap-2">
                        <Archive className="h-5 w-5 text-lavender flex-shrink-0" />
                        {zip.originalName}
                      </CardTitle>
                      <CardDescription>
                        {zip.structure.fileCount} files • {(zip.size / 1024 / 1024).toFixed(2)} MB
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {zip.analysis.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlayZip(zip)}
                          data-testid={`button-play-${zip.id}`}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageZip(zip)}
                          data-testid={`button-manage-${zip.id}`}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload ZIP Archive</CardTitle>
                <CardDescription>
                  Upload a ZIP file to analyze, manage, and play
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ZipUploader onUploadComplete={handleUploadComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stitch">
            <Card>
              <CardHeader>
                <CardTitle>Stitch Archives</CardTitle>
                <CardDescription>
                  Combine multiple ZIP files into one, resolving conflicts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {zips.length < 2 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You need at least 2 ZIP archives to use stitching
                    </p>
                  </div>
                ) : selectedZipsForStitch.length > 0 ? (
                  <StitchingWorkspace
                    selectedZips={selectedZipsForStitch}
                    onRemoveZip={(zipId) => {
                      const zip = zips.find(z => z.id === zipId);
                      if (zip) handleToggleStitchSelection(zip);
                    }}
                    onStitch={handleStitch}
                    onClose={() => setSelectedZipsForStitch([])}
                  />
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select ZIP files to stitch together:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {zips.map((zip) => (
                        <button
                          key={zip.id}
                          onClick={() => handleToggleStitchSelection(zip)}
                          className="p-4 border rounded-lg hover-elevate text-left transition-all"
                          data-testid={`button-select-stitch-${zip.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <Archive className="h-5 w-5 text-lavender flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium truncate">{zip.originalName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {zip.structure.fileCount} files
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ArchiveManager
        zip={selectedZip}
        open={showArchiveManager}
        onClose={() => {
          setShowArchiveManager(false);
          setSelectedZip(null);
        }}
      />

      <ZipPlayer
        zip={selectedZip}
        open={showZipPlayer}
        onClose={() => {
          setShowZipPlayer(false);
          setSelectedZip(null);
        }}
      />
    </div>
  );
}
