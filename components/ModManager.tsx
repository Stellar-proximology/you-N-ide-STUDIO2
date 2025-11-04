import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Plus, 
  FolderOpen, 
  Trash2, 
  Globe, 
  ExternalLink,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  X
} from "lucide-react";
import { FileSystem, type FileNode } from "@/lib/fileSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  files: any[];
}

interface Deployment {
  id: string;
  projectId: string;
  url: string;
  status: "deploying" | "ready" | "failed";
  createdAt: string;
  netlifyApiKey?: string;
}

const PROJECTS_STORAGE_KEY = "youniverse_projects";
const DEPLOYMENTS_STORAGE_KEY = "youniverse_deployments";
const CURRENT_PROJECT_KEY = "youniverse_current_project";

export function ModManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [netlifyApiKey, setNetlifyApiKey] = useState("");
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const { toast } = useToast();

  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    description: "",
  });

  // Load data from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const storedDeployments = localStorage.getItem(DEPLOYMENTS_STORAGE_KEY);
    const storedCurrentProjectId = localStorage.getItem(CURRENT_PROJECT_KEY);

    if (storedProjects) {
      try {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
        
        if (storedCurrentProjectId) {
          const current = parsedProjects.find((p: Project) => p.id === storedCurrentProjectId);
          setCurrentProject(current || null);
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
      }
    }

    if (storedDeployments) {
      try {
        setDeployments(JSON.parse(storedDeployments));
      } catch (e) {
        console.error("Failed to load deployments:", e);
      }
    }

    // Load saved Netlify API key
    const savedKey = localStorage.getItem("netlify_api_key");
    if (savedKey) setNetlifyApiKey(savedKey);
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Save deployments to localStorage
  useEffect(() => {
    localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(deployments));
  }, [deployments]);

  // Save current project
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem(CURRENT_PROJECT_KEY, currentProject.id);
    }
  }, [currentProject]);

  const handleCreateProject = () => {
    if (!newProjectForm.name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    // Save current files as a new project (full tree for project storage)
    const files = FileSystem.getAllFiles();
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectForm.name,
      description: newProjectForm.description,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      files: files,
    };

    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setShowNewProjectDialog(false);
    setNewProjectForm({ name: "", description: "" });

    toast({
      title: "Project created!",
      description: `${newProject.name} is now active`,
    });
  };

  const handleSwitchProject = (project: Project) => {
    if (currentProject) {
      // Save current project's files
      const updatedProjects = projects.map(p => 
        p.id === currentProject.id 
          ? { ...p, files: FileSystem.getAllFiles(), lastModified: new Date().toISOString() }
          : p
      );
      setProjects(updatedProjects);
    }

    // Load new project's files
    if (confirm(`Switch to ${project.name}? Current work will be saved.`)) {
      FileSystem.loadFileTree(project.files);
      setCurrentProject(project);

      toast({
        title: "Project switched!",
        description: `Now working on ${project.name}`,
      });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (confirm(`Delete ${project?.name}? This cannot be undone.`)) {
      setProjects(projects.filter(p => p.id !== projectId));
      setDeployments(deployments.filter(d => d.projectId !== projectId));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }

      toast({
        title: "Project deleted",
        description: `${project?.name} has been removed`,
      });
    }
  };

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

  const handlePreviewProject = (project: Project) => {
    setPreviewProject(project);
    setIframeKey(prev => prev + 1);
  };

  const handleRefreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleDeployToNetlify = async () => {
    if (!netlifyApiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Netlify API key",
        variant: "destructive",
      });
      return;
    }

    if (!currentProject) {
      toast({
        title: "No project selected",
        description: "Please select or create a project first",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);

    try {
      // Get all files and flatten to only actual file nodes (not folders)
      const allNodes = FileSystem.getAllFiles();
      const flattenFiles = (nodes: any[]): any[] => {
        const result: any[] = [];
        for (const node of nodes) {
          if (node.type === 'file' && node.content !== undefined) {
            result.push({
              path: node.path,
              content: node.content
            });
          }
          if (node.children) {
            result.push(...flattenFiles(node.children));
          }
        }
        return result;
      };
      const files = flattenFiles(allNodes);
      const response = await fetch('/api/deploy/netlify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: netlifyApiKey,
          files: files,
          siteName: currentProject.name.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      const newDeployment: Deployment = {
        id: `deploy-${Date.now()}`,
        projectId: currentProject.id,
        url: data.url,
        status: "ready",
        createdAt: new Date().toISOString(),
      };

      setDeployments([...deployments, newDeployment]);

      // Save API key for future use
      localStorage.setItem("netlify_api_key", netlifyApiKey);

      toast({
        title: "Deployed to Netlify! 🚀",
        description: `Your app is live at ${data.url}`,
      });

      setShowDeployDialog(false);
      window.open(data.url, '_blank');

    } catch (error: any) {
      console.error('Deployment error:', error);
      toast({
        title: "Deployment Failed",
        description: error.message || "Could not deploy to Netlify",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleExportProject = () => {
    if (!currentProject) return;

    const exportData = {
      project: currentProject,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Project exported!",
      description: `${currentProject.name} downloaded as JSON`,
    });
  };

  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const importedProject: Project = {
            ...data.project,
            id: `project-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };

          setProjects([...projects, importedProject]);

          toast({
            title: "Project imported!",
            description: `${importedProject.name} is ready`,
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Could not parse project file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const currentDeployments = deployments.filter(d => d.projectId === currentProject?.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-5xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Mod Manager</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Deploy your apps to Netlify and manage multiple projects
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleImportProject}
              data-testid="button-import-project"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowNewProjectDialog(true)}
              data-testid="button-new-project"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            {currentProject && (
              <Card className="mb-6 border-primary/30 bg-primary/5">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {currentProject.name}
                        <Badge variant="outline">Active</Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {currentProject.description || "No description"}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last modified: {new Date(currentProject.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportProject}
                        data-testid="button-export-project"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => setShowDeployDialog(true)}
                        data-testid="button-deploy-to-netlify"
                      >
                        <Rocket className="h-4 w-4 mr-1" />
                        Deploy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card 
                    key={project.id}
                    className={`p-6 hover-elevate transition-all ${
                      currentProject?.id === project.id ? 'border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      {currentProject?.id === project.id && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold mb-1" data-testid={`text-project-name-${project.id}`}>
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modified: {new Date(project.lastModified).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewProject(project)}
                        className="flex-1"
                        data-testid={`button-preview-project-${project.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchProject(project)}
                        className="flex-1"
                        disabled={currentProject?.id === project.id}
                        data-testid={`button-switch-project-${project.id}`}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Switch
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="min-w-[2.5rem]"
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-12 p-8 border-2 border-dashed border-primary/30 rounded-lg text-center bg-card">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-primary/40" />
                <h3 className="text-lg font-semibold mb-2">Create Your First Project</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Organize your work into projects and deploy them anywhere
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setShowNewProjectDialog(true)}
                  data-testid="button-create-first-project"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="deployments" className="mt-6">
            {currentDeployments.length > 0 ? (
              <div className="space-y-4">
                {currentDeployments.map((deployment) => (
                  <Card key={deployment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          deployment.status === 'ready' ? 'bg-green-500/10' :
                          deployment.status === 'deploying' ? 'bg-blue-500/10' :
                          'bg-red-500/10'
                        }`}>
                          {deployment.status === 'ready' && <CheckCircle className="h-6 w-6 text-green-500" />}
                          {deployment.status === 'deploying' && <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />}
                          {deployment.status === 'failed' && <AlertCircle className="h-6 w-6 text-red-500" />}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            {deployment.status === 'ready' ? 'Deployed Successfully' :
                             deployment.status === 'deploying' ? 'Deploying...' :
                             'Deployment Failed'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(deployment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {deployment.status === 'ready' && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(deployment.url, '_blank')}
                          data-testid={`button-view-deployment-${deployment.id}`}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          View Live
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-12 p-8 border-2 border-dashed border-primary/30 rounded-lg text-center bg-card">
                <Rocket className="h-16 w-16 mx-auto mb-4 text-primary/40" />
                <h3 className="text-lg font-semibold mb-2">No Deployments Yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Deploy your project to Netlify to see it here
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setShowDeployDialog(true)}
                  disabled={!currentProject}
                  data-testid="button-deploy-first"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to Netlify
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">Create New Project</DialogTitle>
            <DialogDescription>
              Save your current files as a new project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                data-testid="input-project-name"
                value={newProjectForm.name}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                placeholder="My Awesome App"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                data-testid="input-project-description"
                value={newProjectForm.description}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                placeholder="What does this project do?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreateProject}
              data-testid="button-confirm-create-project"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy to Netlify Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">Deploy to Netlify</DialogTitle>
            <DialogDescription>
              Enter your Netlify API key to deploy {currentProject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="netlify-api-key">Netlify API Key</Label>
              <Input
                id="netlify-api-key"
                type="password"
                data-testid="input-netlify-api-key"
                value={netlifyApiKey}
                onChange={(e) => setNetlifyApiKey(e.target.value)}
                placeholder="nfp_xxxxxxxxxxxxx"
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://app.netlify.com/user/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Netlify Settings
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleDeployToNetlify}
              disabled={isDeploying}
              data-testid="button-confirm-deploy"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Project Dialog */}
      <Dialog open={!!previewProject} onOpenChange={() => setPreviewProject(null)}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col" data-testid="dialog-project-preview">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-primary" />
                <div>
                  <DialogTitle>
                    {previewProject?.name} Preview
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interactive project preview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshPreview}
                  data-testid="button-refresh-preview"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewProject(null)}
                  data-testid="button-close-preview"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 bg-muted rounded-lg overflow-hidden border">
            {previewProject && (
              <iframe
                key={iframeKey}
                srcDoc={generateExecutableHTML(previewProject.files || [])}
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Project Preview"
                data-testid="iframe-project-preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
