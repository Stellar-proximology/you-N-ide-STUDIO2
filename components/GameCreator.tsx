import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Gamepad2, Search, Play, Eye, X, RefreshCw, Download } from "lucide-react";
import { useLocation} from "wouter";
import { GAME_TEMPLATES } from "@/lib/gameTemplates";
import { FileSystem, type FileNode } from "@/lib/fileSystem";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GameCreator() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const { toast } = useToast();

  const filteredTemplates = GAME_TEMPLATES.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateExecutableHTML = (files: FileNode[]): string => {
    const indexFile = files.find(f => f.type === 'file' && f.name === 'index.html');
    if (!indexFile || !indexFile.content) return '';

    let html = indexFile.content;

    const getAllFiles = (nodes: FileNode[]): FileNode[] => {
      let result: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === 'file') {
          result.push(node);
        }
        if (node.children) {
          result = result.concat(getAllFiles(node.children));
        }
      }
      return result;
    };

    const allFiles = getAllFiles(files);

    html = html.replace(/<link\s+rel="stylesheet"\s+href="([^"]+)">/g, (match, href) => {
      const cssFile = allFiles.find(f => f.path === href || f.path.endsWith(href));
      if (cssFile && cssFile.content) {
        return `<style>${cssFile.content}</style>`;
      }
      return match;
    });

    html = html.replace(/<script\s+src="([^"]+)"><\/script>/g, (match, src) => {
      const jsFile = allFiles.find(f => f.path === src || f.path.endsWith(src));
      if (jsFile && jsFile.content) {
        return `<script>${jsFile.content}</script>`;
      }
      return match;
    });

    return html;
  };

  const handlePreviewTemplate = (templateId: string) => {
    setPreviewTemplate(templateId);
    setIframeKey(prev => prev + 1);
  };

  const handleUseTemplate = (templateId: string) => {
    const template = GAME_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`This will replace all current files with the ${template.title} template. Continue?`)) {
      FileSystem.loadFileTree(template.files);

      toast({
        title: "Template Loaded!",
        description: `${template.title} is ready in the IDE`,
      });

      setTimeout(() => {
        setLocation('/ide');
      }, 500);
    }
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleDownloadTemplate = (templateId: string) => {
    const template = GAME_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    toast({
      title: "Download Template",
      description: "Use the template first, then export from the IDE",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Game Templates</h1>
          <p className="text-muted-foreground">Choose a template to start creating your game</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search-templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="p-6 hover:border-primary transition-all hover:shadow-lg"
            >
              <div className="h-32 bg-card rounded-md mb-4 flex items-center justify-center">
                <Gamepad2 className="h-12 w-12 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  data-testid={`button-preview-template-${template.id}`}
                  variant="outline"
                  className="flex-1"
                  onClick={() => handlePreviewTemplate(template.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  data-testid={`button-use-template-${template.id}`}
                  className="flex-1"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Use
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col" data-testid="dialog-template-preview">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-primary" />
                <div>
                  <DialogTitle>
                    {GAME_TEMPLATES.find(t => t.id === previewTemplate)?.title} Preview
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interactive template demo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  data-testid="button-refresh-preview"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewTemplate && handleDownloadTemplate(previewTemplate)}
                  data-testid="button-download-template"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewTemplate(null)}
                  data-testid="button-close-preview"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 bg-muted rounded-lg overflow-hidden border">
            {previewTemplate && (
              <iframe
                key={iframeKey}
                srcDoc={generateExecutableHTML(GAME_TEMPLATES.find(t => t.id === previewTemplate)?.files || [])}
                className="w-full h-full bg-white"
                sandbox={
                  previewTemplate === 'godot-starter'
                    ? "allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock"
                    : "allow-scripts allow-same-origin allow-forms"
                }
                title="Template Preview"
                data-testid="iframe-template-preview"
                allow="cross-origin-isolated"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
