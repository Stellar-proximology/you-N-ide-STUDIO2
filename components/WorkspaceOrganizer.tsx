import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Sparkles, Map, Gamepad2, Code2, BookOpen, 
  Users, DollarSign, FlaskConical, ShoppingBag, Theater, 
  Database, Plus, Trash2, Download, Upload, FileCode,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Category = 
  | 'consciousness' | 'glyph' | 'charts' | 'gameplay'
  | 'technical' | 'theory' | 'social' | 'business'
  | 'lab' | 'store' | 'characters' | 'data';

interface Artifact {
  id: number;
  title: string;
  content: string;
  category: Category;
  isCode: boolean;
  codeLanguage?: string;
  timestamp: string;
}

interface WorkspaceData {
  consciousness: Artifact[];
  glyph: Artifact[];
  charts: Artifact[];
  gameplay: Artifact[];
  technical: Artifact[];
  theory: Artifact[];
  social: Artifact[];
  business: Artifact[];
  lab: Artifact[];
  store: Artifact[];
  characters: Artifact[];
  data: Artifact[];
}

const STORAGE_KEY_APP = 'youniverse_workspace_app';
const STORAGE_KEY_USER = 'youniverse_workspace_user';

const modules = {
  consciousness: {
    icon: Brain,
    title: '5-Body Consciousness',
    description: 'Mind, Body, Heart, Will, Soul frameworks & AI agents',
    color: 'text-purple-600'
  },
  glyph: {
    icon: Sparkles,
    title: 'Glyph & Resonance',
    description: 'Visual systems, generators, resonance logic',
    color: 'text-pink-600'
  },
  charts: {
    icon: Map,
    title: 'Chart & Mapping',
    description: 'Astrology, Human Design, metaphysical systems',
    color: 'text-blue-600'
  },
  gameplay: {
    icon: Gamepad2,
    title: 'Gameplay & Quests',
    description: 'Quest mechanics, progression, Hero\'s Journey',
    color: 'text-green-600'
  },
  technical: {
    icon: Code2,
    title: 'Technical Implementation',
    description: 'HTML mockups, code, APIs, schemas',
    color: 'text-orange-600'
  },
  theory: {
    icon: BookOpen,
    title: 'Theory & Logic',
    description: 'Consciousness theory, field logic, frameworks',
    color: 'text-indigo-600'
  },
  social: {
    icon: Users,
    title: 'Social & Community',
    description: 'Resonance matching, social features',
    color: 'text-cyan-600'
  },
  business: {
    icon: DollarSign,
    title: 'Monetization & Business',
    description: 'Revenue models, pricing, business strategy',
    color: 'text-emerald-600'
  },
  lab: {
    icon: FlaskConical,
    title: 'Lab & Experiments',
    description: 'Testing grounds, prototypes, experimental features',
    color: 'text-yellow-600'
  },
  store: {
    icon: ShoppingBag,
    title: 'Store & Marketplace',
    description: 'Product offerings, mod store, premium content',
    color: 'text-red-600'
  },
  characters: {
    icon: Theater,
    title: 'Character Selection',
    description: 'AI agents, personalities, character designs & traits',
    color: 'text-violet-600'
  },
  data: {
    icon: Database,
    title: 'Data & Resources',
    description: 'Datasets, user info, analytics, reference materials',
    color: 'text-slate-600'
  }
};

const emptyWorkspace = (): WorkspaceData => ({
  consciousness: [],
  glyph: [],
  charts: [],
  gameplay: [],
  technical: [],
  theory: [],
  social: [],
  business: [],
  lab: [],
  store: [],
  characters: [],
  data: []
});

export function WorkspaceOrganizer() {
  const [mode, setMode] = useState<'app' | 'user'>('user');
  const [workspace, setWorkspace] = useState<WorkspaceData>(() => {
    const storageKey = mode === 'app' ? STORAGE_KEY_APP : STORAGE_KEY_USER;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : emptyWorkspace();
  });
  const [showDialog, setShowDialog] = useState(false);
  const [newArtifact, setNewArtifact] = useState<Partial<Artifact>>({
    title: '',
    category: 'consciousness',
    content: '',
    isCode: false,
    codeLanguage: 'javascript'
  });
  const { toast } = useToast();

  const saveWorkspace = (data: WorkspaceData) => {
    const storageKey = mode === 'app' ? STORAGE_KEY_APP : STORAGE_KEY_USER;
    localStorage.setItem(storageKey, JSON.stringify(data));
    setWorkspace(data);
  };

  const toggleMode = () => {
    const newMode = mode === 'app' ? 'user' : 'app';
    setMode(newMode);
    
    const storageKey = newMode === 'app' ? STORAGE_KEY_APP : STORAGE_KEY_USER;
    const stored = localStorage.getItem(storageKey);
    setWorkspace(stored ? JSON.parse(stored) : emptyWorkspace());
    
    toast({
      title: `Switched to ${newMode === 'app' ? 'App' : 'User'} mode`,
      description: newMode === 'app' 
        ? 'Organizing the platform itself'
        : 'Organizing your creations'
    });
  };

  const addArtifact = () => {
    if (!newArtifact.title || !newArtifact.content || !newArtifact.category) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const artifact: Artifact = {
      id: Date.now(),
      title: newArtifact.title,
      content: newArtifact.content,
      category: newArtifact.category,
      isCode: newArtifact.isCode || false,
      codeLanguage: newArtifact.codeLanguage,
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...workspace,
      [artifact.category]: [...workspace[artifact.category], artifact]
    };

    saveWorkspace(updated);
    setNewArtifact({
      title: '',
      category: 'consciousness',
      content: '',
      isCode: false,
      codeLanguage: 'javascript'
    });
    setShowDialog(false);

    toast({
      title: 'Artifact added',
      description: `Added to ${modules[artifact.category].title}`
    });
  };

  const deleteArtifact = (category: Category, id: number) => {
    const updated = {
      ...workspace,
      [category]: workspace[category].filter(a => a.id !== id)
    };
    saveWorkspace(updated);
    
    toast({
      title: 'Artifact deleted',
      description: 'Artifact removed from workspace'
    });
  };

  const exportWorkspace = () => {
    const data = JSON.stringify(workspace, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-${mode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Workspace exported',
      description: 'File downloaded successfully'
    });
  };

  const importWorkspace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            saveWorkspace(data);
            toast({
              title: 'Workspace imported',
              description: 'Data loaded successfully'
            });
          } catch (error) {
            toast({
              title: 'Import failed',
              description: 'Invalid workspace file',
              variant: 'destructive'
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearWorkspace = () => {
    if (confirm('Are you sure you want to clear all artifacts?')) {
      saveWorkspace(emptyWorkspace());
      toast({
        title: 'Workspace cleared',
        description: 'All artifacts have been removed'
      });
    }
  };

  const totalArtifacts = Object.values(workspace).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header with Mode Toggle - header now in DeveloperPanel wrapper */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{totalArtifacts} artifacts</Badge>
        </div>

        <Button
          data-testid="button-toggle-mode"
          onClick={toggleMode}
          variant={mode === 'app' ? 'default' : 'outline'}
          className="gap-2"
        >
          {mode === 'app' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {mode === 'app' ? 'App Mode' : 'User Mode'}
        </Button>
      </div>

      {/* Description */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            {mode === 'app' 
              ? '📱 Organizing the YOU-N-I-VERSE platform itself - features, ideas, and improvements'
              : '👤 Organizing your personal creations, projects, and artifacts'}
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          data-testid="button-add-artifact"
          onClick={() => setShowDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Artifact
        </Button>
        <Button variant="outline" onClick={exportWorkspace} data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" onClick={importWorkspace} data-testid="button-import">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" onClick={clearWorkspace} data-testid="button-clear">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Module Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {(Object.entries(modules) as [Category, typeof modules[Category]][]).map(([key, module]) => {
            const Icon = module.icon;
            const artifacts = workspace[key];

            return (
              <Card key={key} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${module.color}`} />
                      <CardTitle className="text-sm">{module.title}</CardTitle>
                    </div>
                    <Badge className="bg-primary hover:bg-primary/90 text-white">
                      {artifacts.length}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2 pr-4">
                      {artifacts.map((artifact) => (
                        <div
                          key={artifact.id}
                          className="p-3 bg-muted/50 rounded-lg hover-elevate"
                          data-testid={`artifact-${artifact.id}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              {artifact.title}
                              {artifact.isCode && (
                                <Badge variant="outline" className="text-xs">
                                  <FileCode className="h-3 w-3 mr-1" />
                                  {artifact.codeLanguage}
                                </Badge>
                              )}
                            </div>
                            <Button
                              data-testid={`button-delete-${artifact.id}`}
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => deleteArtifact(key, artifact.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {artifact.content.substring(0, 100)}...
                          </p>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => {
                          setNewArtifact({ ...newArtifact, category: key });
                          setShowDialog(true);
                        }}
                        data-testid={`button-add-${key}`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to {module.title}
                      </Button>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Add Artifact Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Artifact</DialogTitle>
            <DialogDescription>
              Create a new artifact in your {mode === 'app' ? 'app' : 'user'} workspace
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                data-testid="input-artifact-title"
                placeholder="Enter title..."
                value={newArtifact.title}
                onChange={(e) => setNewArtifact({ ...newArtifact, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={newArtifact.category}
                onValueChange={(value) => setNewArtifact({ ...newArtifact, category: value as Category })}
              >
                <SelectTrigger data-testid="select-artifact-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(modules) as [Category, typeof modules[Category]][]).map(([key, module]) => (
                    <SelectItem key={key} value={key}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                data-testid="textarea-artifact-content"
                placeholder="Enter content..."
                value={newArtifact.content}
                onChange={(e) => setNewArtifact({ ...newArtifact, content: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newArtifact.isCode}
                  onChange={(e) => setNewArtifact({ ...newArtifact, isCode: e.target.checked })}
                  data-testid="checkbox-is-code"
                  className="rounded"
                />
                <span className="text-sm">This is code</span>
              </label>

              {newArtifact.isCode && (
                <Select
                  value={newArtifact.codeLanguage}
                  onValueChange={(value) => setNewArtifact({ ...newArtifact, codeLanguage: value })}
                >
                  <SelectTrigger className="w-[180px]" data-testid="select-code-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-artifact"
                onClick={addArtifact}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Artifact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
