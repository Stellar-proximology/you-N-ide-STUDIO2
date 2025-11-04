import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Brain, Search, Zap, Play, Sparkles, Eye, X, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { GAN_TEMPLATES } from "@/lib/ganTemplates";
import { FileSystem, type FileNode } from "@/lib/fileSystem";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GANTrainer() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const { toast } = useToast();

  const filteredTemplates = GAN_TEMPLATES.filter(template =>
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
    const template = GAN_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`This will replace all current files with the ${template.title} GAN template. Continue?`)) {
      FileSystem.loadFileTree(template.files);

      toast({
        title: "GAN Template Loaded!",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">GAN Trainer</h1>
            <Zap className="h-6 w-6 text-primary/60" />
          </div>
          <p className="text-muted-foreground">
            Generative Adversarial Networks - Create, train, and deploy AI models in your browser
          </p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search-gan-templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GAN templates..."
            className="pl-10"
          />
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Available GAN Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="p-6 hover:border-primary transition-all hover:shadow-lg"
              >
                <div className="h-32 bg-card rounded-md mb-4 flex items-center justify-center">
                  <Brain className="h-12 w-12 text-primary/40" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{template.title}</h3>
                  {template.pretrained && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Pre-trained
                    </span>
                  )}
                  {!template.pretrained && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      Trainable
                    </span>
                  )}
                </div>
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
                    data-testid={`button-preview-gan-${template.id}`}
                    variant="outline"
                    className="flex-1"
                    onClick={() => handlePreviewTemplate(template.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    data-testid={`button-use-gan-template-${template.id}`}
                    className="flex-1"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Load
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="p-8 border-2 border-dashed border-primary/30 rounded-lg text-center bg-card">
          <Brain className="h-16 w-16 mx-auto mb-4 text-primary/40" />
          <h3 className="text-lg font-semibold mb-2">Upload Your Own GAN</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You can upload pre-trained models or custom GAN implementations via the Player panel
          </p>
          <Button
            variant="outline"
            onClick={() => setLocation('/player')}
          >
            Go to Player
          </Button>
        </section>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col" data-testid="dialog-gan-preview">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <DialogTitle>
                    {GAN_TEMPLATES.find(t => t.id === previewTemplate)?.title} Preview
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interactive GAN trainer demo
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
                  <RefreshCw className="w-4 w-4 mr-2" />
                  Refresh
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
                srcDoc={generateExecutableHTML(GAN_TEMPLATES.find(t => t.id === previewTemplate)?.files || [])}
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="GAN Preview"
                data-testid="iframe-gan-preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
