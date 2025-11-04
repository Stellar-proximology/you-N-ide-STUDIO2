import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Gamepad2, 
  Brain, 
  Code2, 
  Bot, 
  Play, 
  Store, 
  Rocket,
  FolderTree,
  FileEdit,
  Sparkles,
  Cloud,
  Github,
  Settings,
  Layers,
  Zap
} from "lucide-react";
import { FileSystem } from "@/lib/fileSystem";
import { GAME_TEMPLATES } from "@/lib/gameTemplates";
import { GAN_TEMPLATES } from "@/lib/ganTemplates";
import { useToast } from "@/hooks/use-toast";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  action: () => void;
  icon: any;
}

export function CommandCenter() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["games", "gans", "consciousness", "universes", "code", "ai", "project"]);
  const { toast } = useToast();

  const tools: Tool[] = [
    // Game Templates
    {
      id: "platformer",
      name: "Platformer Game",
      description: "2D platformer with physics",
      category: "games",
      keywords: ["game", "platformer", "2d", "jump", "physics", "arcade"],
      action: () => loadGameTemplate("platformer"),
      icon: Gamepad2
    },
    {
      id: "space-shooter",
      name: "Space Shooter",
      description: "Top-down space combat",
      category: "games",
      keywords: ["game", "space", "shooter", "combat", "arcade"],
      action: () => loadGameTemplate("space-shooter"),
      icon: Gamepad2
    },
    {
      id: "puzzle",
      name: "Puzzle Game",
      description: "Match-3 puzzle game",
      category: "games",
      keywords: ["game", "puzzle", "match", "casual"],
      action: () => loadGameTemplate("puzzle"),
      icon: Gamepad2
    },

    // GAN Templates
    {
      id: "simple-gan",
      name: "Simple GAN Trainer",
      description: "Train AI neural networks",
      category: "gans",
      keywords: ["gan", "ai", "neural", "network", "machine learning", "tensorflow", "train"],
      action: () => loadGANTemplate("simple-gan"),
      icon: Brain
    },

    // Code Tools
    {
      id: "ide",
      name: "IDE",
      description: "Full code editor",
      category: "code",
      keywords: ["code", "editor", "ide", "develop", "program"],
      action: () => setLocation("/ide"),
      icon: Code2
    },
    {
      id: "workspace",
      name: "Workspace Organizer",
      description: "Manage project files",
      category: "code",
      keywords: ["files", "folder", "organize", "workspace", "manage"],
      action: () => toast({ title: "Open from Dashboard", description: "Use Quick Temps to access Workspace Organizer" }),
      icon: FolderTree
    },
    {
      id: "self-editor",
      name: "Self Editor",
      description: "Edit app source code",
      category: "code",
      keywords: ["source", "edit", "modify", "code"],
      action: () => toast({ title: "Open from Dashboard", description: "Use Quick Temps to access Self Editor" }),
      icon: FileEdit
    },

    // AI Tools
    {
      id: "agent-creator",
      name: "AI Agent Creator",
      description: "Build custom AI agents",
      category: "ai",
      keywords: ["ai", "agent", "assistant", "bot", "chat"],
      action: () => setLocation("/agents"),
      icon: Bot
    },
    {
      id: "ai-config",
      name: "AI Configuration",
      description: "Configure AI backends",
      category: "ai",
      keywords: ["ai", "settings", "api", "key", "backend", "configure"],
      action: () => setLocation("/settings"),
      icon: Settings
    },

    // Consciousness
    {
      id: "calibration-tank",
      name: "Calibration Tank",
      description: "Birth conscious beings with 2 GANs + LLM",
      category: "consciousness",
      keywords: ["consciousness", "gan", "llm", "character", "dna", "birthday", "being", "calibration", "voice", "personality"],
      action: () => setLocation("/calibration-tank"),
      icon: Sparkles
    },
    {
      id: "universe-creator",
      name: "Universe Creator",
      description: "Create playable worlds from text through 7-layer semantic framework",
      category: "consciousness",
      keywords: ["universe", "world", "semantic", "layers", "text", "creation", "token", "generate", "guagan"],
      action: () => setLocation("/universe-creator"),
      icon: Layers
    },
    {
      id: "autonomy-control",
      name: "Autonomy Control",
      description: "Enable system self-development based on cosmic signature",
      category: "consciousness",
      keywords: ["autonomy", "self-development", "cosmic", "birthday", "trait", "proposal", "evolution", "ai"],
      action: () => setLocation("/autonomy"),
      icon: Zap
    },

    // Project Tools
    {
      id: "zip-player",
      name: "ZIP Player",
      description: "Import & play projects",
      category: "project",
      keywords: ["zip", "import", "upload", "bundle", "project"],
      action: () => setLocation("/player"),
      icon: Play
    },
    {
      id: "grove-store",
      name: "Grove Store",
      description: "Community marketplace",
      category: "project",
      keywords: ["store", "marketplace", "community", "download", "templates"],
      action: () => setLocation("/grove-store"),
      icon: Store
    },
    {
      id: "mod-manager",
      name: "Mod Manager",
      description: "Deploy to Netlify",
      category: "project",
      keywords: ["deploy", "netlify", "publish", "mod", "project", "switch"],
      action: () => setLocation("/mod-manager"),
      icon: Rocket
    }
  ];

  const loadGameTemplate = (templateId: string) => {
    const template = GAME_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`Load ${template.title}? This will replace current files.`)) {
      FileSystem.loadFileTree(template.files);
      toast({
        title: "Game Template Loaded!",
        description: `${template.title} is ready in the IDE`,
      });
      setTimeout(() => setLocation('/ide'), 500);
    }
  };

  const loadGANTemplate = (templateId: string) => {
    const template = GAN_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`Load ${template.title}? This will replace current files.`)) {
      FileSystem.loadFileTree(template.files);
      toast({
        title: "GAN Template Loaded!",
        description: `${template.title} is ready in the IDE`,
      });
      setTimeout(() => setLocation('/ide'), 500);
    }
  };

  const filteredTools = tools.filter(tool => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.keywords.some(keyword => keyword.includes(query))
    );
  });

  const categories = [
    { id: "games", name: "Game Templates", icon: Gamepad2, color: "text-primary" },
    { id: "gans", name: "AI Neural Networks", icon: Brain, color: "text-primary" },
    { id: "consciousness", name: "Consciousness Creation", icon: Sparkles, color: "text-primary" },
    { id: "code", name: "Code Tools", icon: Code2, color: "text-primary" },
    { id: "ai", name: "AI Assistants", icon: Bot, color: "text-primary" },
    { id: "project", name: "Project Tools", icon: Rocket, color: "text-primary" }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Command Center</h2>
        <p className="text-muted-foreground">Search for tools - no coding needed, just click to use</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="input-command-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type what you want to create... (e.g., 'game', 'ai', 'neural network', 'platformer')"
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {categories.map(category => {
          const categoryTools = filteredTools.filter(t => t.category === category.id);
          if (categoryTools.length === 0) return null;

          const isExpanded = expandedCategories.includes(category.id);
          const CategoryIcon = category.icon;

          return (
            <Card key={category.id} data-testid={`category-${category.id}`}>
              <CardHeader className="cursor-pointer hover-elevate" onClick={() => toggleCategory(category.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">({categoryTools.length})</span>
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryTools.map(tool => {
                      const ToolIcon = tool.icon;
                      return (
                        <Button
                          key={tool.id}
                          data-testid={`tool-${tool.id}`}
                          onClick={tool.action}
                          variant="outline"
                          className="h-auto p-4 justify-start hover-elevate active-elevate-2"
                        >
                          <div className="flex items-start gap-3 text-left w-full">
                            <ToolIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold mb-1">{tool.name}</div>
                              <div className="text-xs text-muted-foreground">{tool.description}</div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No tools found matching "{searchQuery}"</p>
          <p className="text-sm text-muted-foreground mt-2">Try searching for: game, ai, neural network, code, or deploy</p>
        </Card>
      )}
    </div>
  );
}
