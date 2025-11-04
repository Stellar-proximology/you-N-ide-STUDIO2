import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Play, Bot, Settings, Store, Clock, Sparkles, ArrowRight, FileEdit, FolderTree, Terminal as TerminalIcon, Zap, Brain, Orbit, Rocket, Globe, Cpu, Palette, type LucideIcon } from "lucide-react";
import { AppRegistry, type AppModule } from "@/lib/appRegistry";
import { ActivityTracker, type AppActivity } from "@/lib/activityTracker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkspaceOrganizer } from "@/components/WorkspaceOrganizer";
import { SelfEditor } from "@/components/SelfEditor";
import { CommandCenter } from "@/components/CommandCenter";

const CORE_APPS: AppModule[] = [
  {
    id: "ide",
    name: "Launch IDE",
    description: "Code editor & developer environment",
    path: "/ide",
    icon: Code2,
    variant: "primary",
    type: "core",
    version: "1.0.0"
  },
  {
    id: "grove-store",
    name: "Grove Store",
    description: "Discover community apps, agents & templates",
    path: "/grove-store",
    icon: Store,
    variant: "primary",
    type: "core",
    version: "1.0.0"
  },
  {
    id: "zip-manager",
    name: "ZIP Archive Studio",
    description: "Upload, manage, play & stitch ZIP files - all in one place",
    path: "/zip-manager",
    icon: FolderTree,
    variant: "primary",
    type: "core",
    version: "1.0.0"
  },
  {
    id: "agents",
    name: "Agent Creator",
    description: "Build & manage AI agents",
    path: "/agents",
    icon: Bot,
    type: "core",
    version: "1.0.0"
  },
  {
    id: "settings",
    name: "Settings",
    description: "Configure AI backends & preferences",
    path: "/settings",
    icon: Settings,
    type: "core",
    version: "1.0.0"
  }
];

const FLAGSHIP_FEATURES = [
  {
    id: "universe-creator",
    title: "Semantic Universe Creator",
    description: "Transform text into playable 3D worlds using seven-layer consciousness framework",
    icon: Globe,
    path: "/universe-creator"
  },
  {
    id: "calibration-tank",
    title: "Consciousness Calibration Tank",
    description: "Build multi-model neural networks with visual connection builder and auto-code generation",
    icon: Brain,
    path: "/calibration-tank"
  },
  {
    id: "gan-trainer",
    title: "GAN Trainer",
    description: "Train generative adversarial networks for creative AI model development",
    icon: Cpu,
    path: "/gan-trainer"
  },
  {
    id: "autonomy",
    title: "Autonomy Control Center",
    description: "System self-development with Fu Xi I-Ching codon-based proposal generation",
    icon: Orbit,
    path: "/autonomy"
  },
  {
    id: "mod-manager",
    title: "Deployment Hub",
    description: "Deploy to Netlify, push to GitHub, export to Google Drive with one-click",
    icon: Rocket,
    path: "/mod-manager"
  },
  {
    id: "game-creator",
    title: "Game Creator",
    description: "Build interactive experiences with templates and visual tools",
    icon: Palette,
    path: "/game-creator"
  }
];

export function Dashboard() {
  const [, setLocation] = useLocation();
  const [apps, setApps] = useState<AppModule[]>(CORE_APPS);
  const [recentlyVisited, setRecentlyVisited] = useState<AppActivity[]>([]);
  const [showWorkspaceDialog, setShowWorkspaceDialog] = useState(false);
  const [showSelfEditorDialog, setShowSelfEditorDialog] = useState(false);
  const [showCommandCenterDialog, setShowCommandCenterDialog] = useState(false);

  useEffect(() => {
    const customApps = AppRegistry.getInstalledApps();
    if (customApps.length > 0) {
      setApps([...CORE_APPS, ...customApps]);
    }

    setRecentlyVisited(ActivityTracker.getRecentlyVisited(4));
  }, []);

  const handleAppClick = (appId: string, appName: string, appType: string, path: string) => {
    ActivityTracker.recordVisit(appId, appName, appType);
    setLocation(path);
  };

  const getIconForApp = (appId: string) => {
    const app = [...CORE_APPS, ...AppRegistry.getInstalledApps()].find(a => a.id === appId);
    return app?.icon || Code2;
  };

  const getPathForApp = (appId: string) => {
    const app = [...CORE_APPS, ...AppRegistry.getInstalledApps()].find(a => a.id === appId);
    return app?.path || `/${appId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Sleek & Minimal */}
      <div className="relative overflow-hidden bg-muted/20 border-b">
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                YOU–N–I–VERSE Studio
              </h1>
              <div className="h-px bg-border mt-3" />
            </div>
            
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
              Build, create, and deploy in one unified workspace
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => setLocation("/ide")}
                data-testid="button-hero-ide"
              >
                <Code2 className="h-5 w-5 mr-2" />
                Launch IDE
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/game-creator")}
                data-testid="button-hero-game-creator"
              >
                <Palette className="h-5 w-5 mr-2" />
                Create Game
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/zip-manager")}
                data-testid="button-hero-zip-manager"
              >
                <FolderTree className="h-5 w-5 mr-2" />
                Upload & Play
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Recently Visited */}
        {recentlyVisited.length > 0 && (
          <Card className="mb-6" data-testid="card-recent-apps">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentlyVisited.map((activity) => (
                  <ActivityCard
                    key={activity.appId}
                    activity={activity}
                    icon={getIconForApp(activity.appId)}
                    onClick={() => handleAppClick(
                      activity.appId,
                      activity.appName,
                      activity.appType,
                      getPathForApp(activity.appId)
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flagship Features - Consciousness Engine */}
        <Card className="mb-6 border-primary/30" data-testid="card-flagship-features">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Consciousness Engine</CardTitle>
            </div>
            <CardDescription>Transformative tools powered by semantic awareness and neural architecture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FLAGSHIP_FEATURES.map((feature) => (
                <button
                  key={feature.id}
                  data-testid={`button-flagship-${feature.id}`}
                  onClick={() => setLocation(feature.path)}
                  className="group relative h-48 rounded-lg border-2 border-border bg-card hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative flex flex-col items-start justify-between h-full p-6 text-left">
                    <div>
                      <feature.icon className="h-10 w-10 mb-3 text-primary" />
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium mt-2">
                      <span>Launch</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tools */}
        <Card className="mb-6" data-testid="card-quick-tools">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Quick Tools</CardTitle>
            </div>
            <CardDescription>Organize workspace and edit code without leaving the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                data-testid="button-open-workspace"
                onClick={() => setShowWorkspaceDialog(true)}
                className="group relative h-32 rounded-lg border-2 bg-card border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <FolderTree className="h-10 w-10 mb-3 text-primary" />
                  <h3 className="text-base font-semibold mb-1">Workspace Organizer</h3>
                  <p className="text-sm text-muted-foreground">Manage project files</p>
                </div>
              </button>
              <button
                data-testid="button-open-self-editor"
                onClick={() => setShowSelfEditorDialog(true)}
                className="group relative h-32 rounded-lg border-2 bg-card border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <FileEdit className="h-10 w-10 mb-3 text-primary" />
                  <h3 className="text-base font-semibold mb-1">Self Editor</h3>
                  <p className="text-sm text-muted-foreground">Edit source code</p>
                </div>
              </button>
              <button
                data-testid="button-open-command-center"
                onClick={() => setShowCommandCenterDialog(true)}
                className="group relative h-32 rounded-lg border-2 bg-primary/10 border-primary hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <TerminalIcon className="h-10 w-10 mb-3 text-primary" />
                  <h3 className="text-base font-semibold mb-1">Command Center</h3>
                  <p className="text-sm text-muted-foreground">Search & launch tools</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Core Apps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Launch Pad</CardTitle>
            <CardDescription>Essential creative tools and platform utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <PortalButton
                  key={app.id}
                  icon={app.icon}
                  title={app.name}
                  description={app.description}
                  onClick={() => handleAppClick(app.id, app.name, app.type, app.path)}
                  variant={app.variant}
                  testId={`button-portal-${app.id}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <p className="text-sm font-medium">Welcome to your cosmic creative workspace</p>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">
            Gateway v1.0.0 • {apps.length} modules • Powered by consciousness
          </p>
        </div>
      </div>

      {/* Workspace Organizer Dialog */}
      <Dialog open={showWorkspaceDialog} onOpenChange={setShowWorkspaceDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              Workspace Organizer
            </DialogTitle>
            <DialogDescription>
              Manage your project files and folders
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <WorkspaceOrganizer />
          </div>
        </DialogContent>
      </Dialog>

      {/* Self Editor Dialog */}
      <Dialog open={showSelfEditorDialog} onOpenChange={setShowSelfEditorDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-primary" />
              Self Editor
            </DialogTitle>
            <DialogDescription>
              Edit the source code of YOU–N–I–VERSE Studio itself
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <SelfEditor />
          </div>
        </DialogContent>
      </Dialog>

      {/* Command Center Dialog */}
      <Dialog open={showCommandCenterDialog} onOpenChange={setShowCommandCenterDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <div className="overflow-auto max-h-[90vh]">
            <CommandCenter />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ActivityCardProps {
  activity: AppActivity;
  icon: LucideIcon | string;
  onClick: () => void;
}

function ActivityCard({ activity, icon: Icon, onClick }: ActivityCardProps) {
  const isImageIcon = typeof Icon === 'string';
  const timeAgo = (date: string) => {
    if (!date) return 'New';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <button
      onClick={onClick}
      data-testid={`activity-card-${activity.appId}`}
      className="flex items-center gap-3 p-3 rounded-md border bg-card hover-elevate active-elevate-2 text-left transition-all"
    >
      <div className="flex-shrink-0">
        {isImageIcon ? (
          <img src={Icon as string} alt={activity.appName} className="h-8 w-8 object-contain" />
        ) : (
          <Icon className="h-8 w-8 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{activity.appName}</p>
        <p className="text-xs text-muted-foreground">{timeAgo(activity.lastVisited)}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

interface PortalButtonProps {
  icon: LucideIcon | string;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "primary" | "default";
  testId?: string;
}

function PortalButton({ icon: Icon, title, description, onClick, variant = "default", testId }: PortalButtonProps) {
  const isImageIcon = typeof Icon === 'string';
  
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`group relative h-40 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        variant === "primary"
          ? "bg-primary border-primary text-white hover:bg-primary/90"
          : "bg-card border-border hover:border-primary"
      }`}
    >
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        {isImageIcon ? (
          <img 
            src={Icon as string} 
            alt={title} 
            className="h-12 w-12 mb-4 object-contain" 
          />
        ) : (
          <Icon className={`h-12 w-12 mb-4 ${variant === "primary" ? "text-white" : "text-primary"}`} />
        )}
        <h3 className={`text-lg font-semibold mb-2 ${variant === "primary" ? "text-white" : "text-foreground"}`}>
          {title}
        </h3>
        <p className={`text-sm ${variant === "primary" ? "text-white/80" : "text-muted-foreground"}`}>
          {description}
        </p>
      </div>
    </button>
  );
}
