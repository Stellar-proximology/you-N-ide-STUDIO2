/**
 * Mode Indicator
 * Shows active workspace mode with visual cues
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WorkspaceManager } from "@/lib/workspaceManager";
import type { WorkspaceState } from "@shared/workspace-modes";
import { MODE_CONFIGS } from "@shared/workspace-modes";
import { X, Target, Sparkles, Users, BookOpen, GitMerge, Circle, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ICON_MAP = {
  Target,
  Sparkles,
  Users,
  BookOpen,
  GitMerge,
  Circle
};

export function ModeIndicator() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>(WorkspaceManager.getState());
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<WorkspaceState>;
      setWorkspaceState(customEvent.detail);
    };

    window.addEventListener('workspaceStateChanged', handleStateChange);
    
    return () => {
      window.removeEventListener('workspaceStateChanged', handleStateChange);
    };
  }, []);

  const deactivate = () => {
    WorkspaceManager.deactivateProgram();
    toast({
      title: "Program Deactivated",
      description: "Returned to neutral workspace mode"
    });
  };

  const { activeProgram } = workspaceState;
  
  if (!activeProgram) return null;

  const modeConfig = MODE_CONFIGS[activeProgram.mode];
  const IconComponent = ICON_MAP[modeConfig.icon as keyof typeof ICON_MAP] || Circle;

  if (!isExpanded) {
    return (
      <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50">
        <Button
          size="icon"
          variant="default"
          onClick={() => setIsExpanded(true)}
          className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12"
          style={{ backgroundColor: modeConfig.color }}
          data-testid="button-expand-mode"
        >
          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    );
  }

  return (
    <Card 
      className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 p-3 sm:p-4 shadow-lg w-[calc(100vw-1rem)] sm:w-auto sm:max-w-sm border-2 animate-in slide-in-from-right duration-300"
      style={{ borderColor: modeConfig.color }}
      data-testid="card-mode-indicator"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${modeConfig.color}20`, color: modeConfig.color }}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant="secondary"
                className="text-xs"
                data-testid="badge-mode-name"
              >
                {activeProgram.mode.toUpperCase()}
              </Badge>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            
            <h3 className="font-semibold text-sm mb-1" data-testid="text-program-name">
              {activeProgram.programName}
            </h3>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {modeConfig.description}
            </p>
            
            <div className="mt-2 flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={deactivate}
                className="gap-1 h-7 text-xs"
                data-testid="button-deactivate-program"
              >
                <Square className="h-3 w-3" />
                End Session
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="h-7 w-7 p-0"
                data-testid="button-minimize-indicator"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {activeProgram.toolRecommendations.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Tools:</p>
          <div className="flex flex-wrap gap-1">
            {activeProgram.toolRecommendations.map((tool, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs"
                data-testid={`badge-tool-${idx}`}
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
