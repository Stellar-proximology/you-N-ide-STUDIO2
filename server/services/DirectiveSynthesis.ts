/**
 * Directive Synthesis - Blends multiple program activations into unified workspace mode
 * 
 * Uses weighted blending to create coherent directives from multiple active programs
 */

import type {
  ProgramActivation,
  CompositeDirective,
  WorkspaceDirective
} from "../../shared/growth-programs";

export class DirectiveSynthesizer {
  /**
   * Synthesize multiple program activations into single directive
   * 
   * Strategy:
   * - Primary mode comes from highest-scoring program
   * - Actions are merged from top N programs (weighted by score)
   * - Tools are union of all recommendations
   * - Ambient settings come from primary program
   */
  synthesize(
    activations: ProgramActivation[],
    maxBlend: number = 3
  ): CompositeDirective {
    if (activations.length === 0) {
      return this.getDefaultDirective();
    }

    // Sort by score (should already be sorted, but ensure it)
    const sorted = [...activations].sort((a, b) => b.matchScore - a.matchScore);
    
    // Take top N for blending
    const topPrograms = sorted.slice(0, maxBlend);
    const primary = topPrograms[0];

    // Blend actions from all top programs
    const blendedActions = this.blendActions(topPrograms);
    
    // Union of tool recommendations
    const toolRecommendations = this.mergeTools(topPrograms);

    // Generate human-readable synthesis
    const synthesis = this.generateSynthesis(topPrograms);

    return {
      primaryMode: primary.program.directive.mode,
      blendedActions,
      toolRecommendations,
      ambientSettings: primary.program.directive.ambientSettings,
      activeProgramIds: topPrograms.map(p => p.program.id),
      synthesis
    };
  }

  /**
   * Blend actions from multiple programs with weighted priority
   */
  private blendActions(activations: ProgramActivation[]): string[] {
    const actionMap = new Map<string, number>();

    // Weight each action by its program's match score
    for (const activation of activations) {
      const weight = activation.matchScore;
      for (const action of activation.program.directive.suggestedActions) {
        const currentWeight = actionMap.get(action) || 0;
        actionMap.set(action, currentWeight + weight);
      }
    }

    // Sort by weight descending, take top 5-7 actions
    const sortedActions = Array.from(actionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([action]) => action);

    return sortedActions;
  }

  /**
   * Merge tool recommendations (union, prioritized by primary program)
   */
  private mergeTools(activations: ProgramActivation[]): string[] {
    const toolSet = new Set<string>();
    const toolScores = new Map<string, number>();

    for (const activation of activations) {
      const weight = activation.matchScore;
      for (const tool of activation.program.directive.toolRecommendations) {
        toolSet.add(tool);
        const currentScore = toolScores.get(tool) || 0;
        toolScores.set(tool, currentScore + weight);
      }
    }

    // Sort by score, return top tools
    return Array.from(toolSet)
      .sort((a, b) => (toolScores.get(b) || 0) - (toolScores.get(a) || 0))
      .slice(0, 5);
  }

  /**
   * Generate human-readable synthesis explanation
   */
  private generateSynthesis(activations: ProgramActivation[]): string {
    if (activations.length === 1) {
      const program = activations[0].program;
      return `**${program.name}** (${program.archetype}): ${program.description}`;
    }

    const primary = activations[0];
    const secondary = activations.slice(1);

    let synthesis = `**Primary: ${primary.program.name}** (${(primary.matchScore * 100).toFixed(0)}% match)\n`;
    synthesis += `${primary.program.description}\n\n`;

    if (secondary.length > 0) {
      synthesis += `**Blending with:**\n`;
      for (const activation of secondary) {
        const score = (activation.matchScore * 100).toFixed(0);
        synthesis += `• ${activation.program.name} (${score}%)\n`;
      }
      
      synthesis += `\n**Synthesis:** Your current state activates multiple archetypal patterns. `;
      synthesis += `Focus on ${primary.program.directive.mode} while staying open to `;
      synthesis += `${secondary.map(a => a.program.directive.mode).join(" and ")} energies.`;
    }

    // Add trigger explanations
    if (primary.activeConditions.length > 0) {
      synthesis += `\n\n**Why this program?**\n`;
      for (const condition of primary.activeConditions.slice(0, 3)) {
        synthesis += `• ${condition}\n`;
      }
    }

    return synthesis;
  }

  /**
   * Default directive when no programs match
   */
  private getDefaultDirective(): CompositeDirective {
    return {
      primaryMode: "integrate",
      blendedActions: [
        "Review your current projects",
        "Organize your workspace",
        "Set intentions for your session",
        "Check in with Guard Dog for guidance"
      ],
      toolRecommendations: ["Dashboard", "IDE"],
      ambientSettings: {
        theme: "balanced",
        aiAssistantBehavior: "supportive"
      },
      activeProgramIds: [],
      synthesis: "**Balanced State**: No strong archetypal activation detected. This is a good time for general maintenance and exploration."
    };
  }
}
