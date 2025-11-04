/**
 * Growth Program Engine - Archetypal Programs & Type System
 * 
 * Programs interpret transit field vectors and orchestrate workspace modes.
 * Each program has declarative trigger conditions and behavior directives.
 */

import type { FieldName, Planet } from "./transit-system";

// ========== Core Types ==========

export type ProgramTriggerOperator = "AND" | "OR" | "NOT";

export interface ProgramTrigger {
  operator?: ProgramTriggerOperator;
  conditions: TriggerCondition[];
}

export type TriggerCondition = 
  | FieldPressureCondition
  | ResonanceCondition
  | PlanetaryAspectCondition
  | CompositeCondition;

export interface FieldPressureCondition {
  type: "field_pressure";
  field: FieldName;
  threshold: number; // 0-1 scale
  comparator: ">" | "<" | ">=";
}

export interface ResonanceCondition {
  type: "resonance";
  field: FieldName;
  minAlignment: number; // 0-1 scale (based on user's chart alignment with current transits)
}

export interface PlanetaryAspectCondition {
  type: "planetary_aspect";
  planet: Planet;
  aspect: "retrograde" | "direct" | "fast" | "slow";
}

export interface CompositeCondition {
  type: "composite";
  operator: ProgramTriggerOperator;
  conditions: TriggerCondition[];
}

export interface WorkspaceDirective {
  mode: "focus" | "create" | "collaborate" | "reflect" | "integrate";
  suggestedActions: string[];
  toolRecommendations: string[]; // IDE panels to prioritize
  ambientSettings?: {
    theme?: "high-contrast" | "low-stimulation" | "balanced";
    aiAssistantBehavior?: "minimal" | "proactive" | "supportive";
  };
}

export interface GrowthProgram {
  id: string;
  name: string;
  archetype: string;
  description: string;
  trigger: ProgramTrigger;
  directive: WorkspaceDirective;
  duration?: number; // Optional: suggested program duration in minutes
  weight: number; // Base weight for blending (0-1)
}

// ========== Field Vector Analysis ==========

export interface FieldVectorAnalysis {
  dominantFields: FieldName[];
  pressureMap: Record<FieldName, number>;
  resonanceMap: Record<FieldName, number>;
  aspectMap: Record<string, string>; // planet -> aspect status
}

export interface ProgramActivation {
  program: GrowthProgram;
  matchScore: number; // 0-1 how well conditions match current state
  activeConditions: string[]; // Human-readable list of why this triggered
}

export interface CompositeDirective {
  primaryMode: WorkspaceDirective["mode"];
  blendedActions: string[];
  toolRecommendations: string[];
  ambientSettings: WorkspaceDirective["ambientSettings"];
  activeProgramIds: string[];
  synthesis: string; // Human-readable explanation of the blend
}

// ========== 5 Archetypal Programs ==========

export const ARCHETYPAL_PROGRAMS: GrowthProgram[] = [
  {
    id: "focus_sprint",
    name: "Focus Sprint",
    archetype: "The Builder",
    description: "High-energy execution mode. Strong willpower and structured momentum. Best for implementation and shipping.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "Will",
          threshold: 0.6,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "Mind",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "planetary_aspect",
          planet: "Mars",
          aspect: "direct"
        }
      ]
    },
    directive: {
      mode: "focus",
      suggestedActions: [
        "Close open loops - finish what you started",
        "Break down large tasks into 25-min sprints",
        "Minimize context switching",
        "Ship small, ship often"
      ],
      toolRecommendations: ["IDE", "Terminal", "File Explorer"],
      ambientSettings: {
        theme: "high-contrast",
        aiAssistantBehavior: "minimal"
      }
    },
    duration: 90, // 90-min sprint
    weight: 1.0
  },

  {
    id: "creative_flow",
    name: "Creative Flow",
    archetype: "The Artist",
    description: "Imaginative exploration mode. High emotional receptivity and innovative thinking. Best for ideation and design.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "Emotions",
          threshold: 0.6,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "ThroatExpression",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "resonance",
          field: "Ajna",
          minAlignment: 0.4
        }
      ]
    },
    directive: {
      mode: "create",
      suggestedActions: [
        "Sketch UI concepts without constraints",
        "Experiment with new libraries or frameworks",
        "Refactor for elegance, not just function",
        "Follow curiosity - explore tangents"
      ],
      toolRecommendations: ["GameCreator", "GANTrainer", "IDE", "UniverseCreator"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "supportive"
      }
    },
    duration: 120,
    weight: 0.9
  },

  {
    id: "collaborative_surge",
    name: "Collaborative Surge",
    archetype: "The Connector",
    description: "Team-oriented mode. High social energy and communication clarity. Best for pair programming and knowledge sharing.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "ThroatExpression",
          threshold: 0.7,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "SacralLife",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "planetary_aspect",
          planet: "Mercury",
          aspect: "direct"
        }
      ]
    },
    directive: {
      mode: "collaborate",
      suggestedActions: [
        "Share your work in Grove Store",
        "Write documentation or tutorials",
        "Ask for code review from Guard Dog",
        "Contribute to open issues or discussions"
      ],
      toolRecommendations: ["GroveStore", "IDE", "AgentPanel"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "proactive"
      }
    },
    duration: 60,
    weight: 0.8
  },

  {
    id: "reflective_depth",
    name: "Reflective Depth",
    archetype: "The Philosopher",
    description: "Introspective mode. High mental clarity and pattern recognition. Best for architecture planning and debugging complex systems.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "Mind",
          threshold: 0.7,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "Ajna",
          threshold: 0.6,
          comparator: ">="
        },
        {
          type: "composite",
          operator: "OR",
          conditions: [
            {
              type: "planetary_aspect",
              planet: "Mercury",
              aspect: "retrograde"
            },
            {
              type: "planetary_aspect",
              planet: "Saturn",
              aspect: "slow"
            }
          ]
        }
      ]
    },
    directive: {
      mode: "reflect",
      suggestedActions: [
        "Review system architecture - identify technical debt",
        "Debug persistent issues methodically",
        "Read documentation deeply",
        "Plan next sprint without coding yet"
      ],
      toolRecommendations: ["IDE", "Dashboard", "SettingsPanel"],
      ambientSettings: {
        theme: "low-stimulation",
        aiAssistantBehavior: "minimal"
      }
    },
    duration: 90,
    weight: 0.85
  },

  {
    id: "integration_mode",
    name: "Integration Mode",
    archetype: "The Synthesizer",
    description: "Holistic consolidation mode. Balanced field activation. Best for merging branches, updating dependencies, and system maintenance.",
    trigger: {
      operator: "AND",
      conditions: [
        {
          type: "field_pressure",
          field: "SolarIdentity",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "field_pressure",
          field: "SacralLife",
          threshold: 0.5,
          comparator: ">="
        },
        {
          type: "resonance",
          field: "Root",
          minAlignment: 0.5
        }
      ]
    },
    directive: {
      mode: "integrate",
      suggestedActions: [
        "Merge feature branches",
        "Update package dependencies",
        "Run full test suite",
        "Clean up workspace - close unused tabs"
      ],
      toolRecommendations: ["IDE", "ModManager", "Dashboard"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "supportive"
      }
    },
    duration: 45,
    weight: 0.7
  }
];

// ========== Helper Functions ==========

export function getProgramById(id: string): GrowthProgram | undefined {
  return ARCHETYPAL_PROGRAMS.find(p => p.id === id);
}

export function getAllPrograms(): GrowthProgram[] {
  return ARCHETYPAL_PROGRAMS;
}
