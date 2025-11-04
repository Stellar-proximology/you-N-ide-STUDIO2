/**
 * Workspace Modes System
 * Manages active program states and workspace configurations
 */

import type { GrowthProgram } from "./growth-programs";

export type WorkspaceMode = 
  | "focus"       // Deep work, minimize distractions
  | "creative"    // Open exploration, multiple tools
  | "collaborate" // Team-oriented, communication focus
  | "reflect"     // Analysis, review, planning
  | "integrate"   // Synthesis, combining work
  | "neutral";    // Default state

export interface ActiveProgram {
  programId: string;
  programName: string;
  mode: WorkspaceMode;
  activatedAt: string;
  toolRecommendations: string[];
  fieldContributions: Record<string, { strength: number }>;
  directive: string;
}

export interface WorkspaceState {
  activeProgram: ActiveProgram | null;
  programHistory: ProgramSession[];
  preferences: {
    autoTransition: boolean;
    showModeIndicator: boolean;
    notificationsEnabled: boolean;
  };
}

export interface ProgramSession {
  programId: string;
  programName: string;
  mode: WorkspaceMode;
  startTime: string;
  endTime: string | null;
  duration: number; // seconds
  userRating: number | null; // 0-1
  fieldResonances: Record<string, number>;
}

// Mode-specific configurations
export const MODE_CONFIGS: Record<WorkspaceMode, {
  color: string;
  icon: string;
  description: string;
  recommendedPanels: string[];
  autoHidePanels: string[];
}> = {
  focus: {
    color: "hsl(280, 70%, 60%)",
    icon: "Target",
    description: "Deep work mode - minimize distractions",
    recommendedPanels: ["IDE", "GameCreator"],
    autoHidePanels: ["GroveStore", "AgentPanel"]
  },
  creative: {
    color: "hsl(45, 95%, 55%)",
    icon: "Sparkles",
    description: "Creative flow - explore freely",
    recommendedPanels: ["IDE", "GameCreator", "GANTrainer", "UniverseCreator"],
    autoHidePanels: []
  },
  collaborate: {
    color: "hsl(200, 80%, 50%)",
    icon: "Users",
    description: "Collaboration mode - share and connect",
    recommendedPanels: ["AgentPanel", "IDE", "GroveStore"],
    autoHidePanels: []
  },
  reflect: {
    color: "hsl(260, 65%, 55%)",
    icon: "BookOpen",
    description: "Reflection mode - review and plan",
    recommendedPanels: ["Dashboard", "SettingsPanel"],
    autoHidePanels: ["GameCreator", "GANTrainer"]
  },
  integrate: {
    color: "hsl(340, 75%, 55%)",
    icon: "GitMerge",
    description: "Integration mode - synthesize work",
    recommendedPanels: ["IDE", "ModManager", "PlayerPanel"],
    autoHidePanels: []
  },
  neutral: {
    color: "hsl(0, 0%, 50%)",
    icon: "Circle",
    description: "Default workspace",
    recommendedPanels: [],
    autoHidePanels: []
  }
};

// Map program types to workspace modes
export function programToMode(programName: string): WorkspaceMode {
  const lower = programName.toLowerCase();
  
  if (lower.includes("focus") || lower.includes("sprint")) return "focus";
  if (lower.includes("creative") || lower.includes("flow")) return "creative";
  if (lower.includes("collaborative") || lower.includes("surge")) return "collaborate";
  if (lower.includes("reflective") || lower.includes("depth")) return "reflect";
  if (lower.includes("integration")) return "integrate";
  
  return "neutral";
}
