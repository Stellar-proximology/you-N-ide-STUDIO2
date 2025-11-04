import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Box, ListTodo, Terminal, RefreshCw, Sparkles } from "lucide-react";
import type { Template } from "@shared/schema";
import type { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  Cube: Box,
  ListTodo,
  Terminal,
  RefreshCw,
};

export function TemplateLibrary({ onProjectCreated }: { onProjectCreated: (project: Project) => void }) {
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const generateFromTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const result = await apiRequest("POST", `/api/templates/${templateId}/generate`, {});
      return result as Project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      
      toast({
        title: "Template Created!",
        description: `${project.name} has been created from template`,
      });

      onProjectCreated(project);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate from template",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Quick Start Templates</h2>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Start with a pre-built template and customize it to your needs. Click "Use Template" to create an instant project.
        </p>

        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryTemplates.map((template) => {
                const Icon = iconMap[template.icon] || Cube;
                return (
                  <Card key={template.id} className="hover-elevate active-elevate-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base truncate">{template.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">{template.language}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                      <Button
                        data-testid={`button-use-template-${template.id}`}
                        size="sm"
                        className="w-full"
                        onClick={() => generateFromTemplate.mutate(template.id)}
                        disabled={generateFromTemplate.isPending}
                      >
                        {generateFromTemplate.isPending ? "Creating..." : "Use Template"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
