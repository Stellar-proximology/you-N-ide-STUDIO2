/**
 * Rules Engine - Evaluates program triggers against current transit state
 * 
 * Supports declarative condition evaluation with AND/OR/NOT logic
 */

import type {
  ProgramTrigger,
  TriggerCondition,
  FieldPressureCondition,
  ResonanceCondition,
  PlanetaryAspectCondition,
  CompositeCondition,
  FieldVectorAnalysis,
  GrowthProgram,
  ProgramActivation
} from "../../shared/growth-programs";
import type { FieldVector } from "../../shared/transit-system";

export class RulesEngine {
  /**
   * Evaluate all programs against current state
   * Returns programs sorted by match score (highest first)
   */
  evaluatePrograms(
    programs: GrowthProgram[],
    analysis: FieldVectorAnalysis,
    fieldVectors: FieldVector[]
  ): ProgramActivation[] {
    const activations: ProgramActivation[] = [];

    for (const program of programs) {
      const result = this.evaluateProgramTrigger(
        program.trigger,
        analysis,
        fieldVectors
      );

      if (result.matches) {
        activations.push({
          program,
          matchScore: result.score * program.weight,
          activeConditions: result.reasons
        });
      }
    }

    // Sort by match score descending
    return activations.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Evaluate a program trigger (top-level condition group)
   */
  private evaluateProgramTrigger(
    trigger: ProgramTrigger,
    analysis: FieldVectorAnalysis,
    fieldVectors: FieldVector[]
  ): EvaluationResult {
    const operator = trigger.operator || "AND";
    
    const results = trigger.conditions.map(condition =>
      this.evaluateCondition(condition, analysis, fieldVectors)
    );

    return this.combineResults(results, operator);
  }

  /**
   * Evaluate a single condition (dispatches to specific type handlers)
   */
  private evaluateCondition(
    condition: TriggerCondition,
    analysis: FieldVectorAnalysis,
    fieldVectors: FieldVector[]
  ): EvaluationResult {
    switch (condition.type) {
      case "field_pressure":
        return this.evaluateFieldPressure(condition, analysis);
      case "resonance":
        return this.evaluateResonance(condition, analysis);
      case "planetary_aspect":
        return this.evaluatePlanetaryAspect(condition, analysis);
      case "composite":
        return this.evaluateComposite(condition, analysis, fieldVectors);
      default:
        return { matches: false, score: 0, reasons: [] };
    }
  }

  /**
   * Evaluate field pressure condition
   */
  private evaluateFieldPressure(
    condition: FieldPressureCondition,
    analysis: FieldVectorAnalysis
  ): EvaluationResult {
    const pressure = analysis.pressureMap[condition.field] || 0;
    let matches = false;

    switch (condition.comparator) {
      case ">":
        matches = pressure > condition.threshold;
        break;
      case "<":
        matches = pressure < condition.threshold;
        break;
      case ">=":
        matches = pressure >= condition.threshold;
        break;
    }

    const score = matches ? pressure : 0;
    const reason = matches
      ? `${condition.field} pressure (${pressure.toFixed(2)}) ${condition.comparator} ${condition.threshold}`
      : "";

    return {
      matches,
      score,
      reasons: matches ? [reason] : []
    };
  }

  /**
   * Evaluate resonance condition
   */
  private evaluateResonance(
    condition: ResonanceCondition,
    analysis: FieldVectorAnalysis
  ): EvaluationResult {
    const resonance = analysis.resonanceMap[condition.field] || 0;
    const matches = resonance >= condition.minAlignment;

    const score = matches ? resonance : 0;
    const reason = matches
      ? `${condition.field} resonance (${resonance.toFixed(2)}) >= ${condition.minAlignment}`
      : "";

    return {
      matches,
      score,
      reasons: matches ? [reason] : []
    };
  }

  /**
   * Evaluate planetary aspect condition
   */
  private evaluatePlanetaryAspect(
    condition: PlanetaryAspectCondition,
    analysis: FieldVectorAnalysis
  ): EvaluationResult {
    const currentAspect = analysis.aspectMap[condition.planet];
    const matches = currentAspect === condition.aspect;

    const score = matches ? 1.0 : 0;
    const reason = matches
      ? `${condition.planet} is ${condition.aspect}`
      : "";

    return {
      matches,
      score,
      reasons: matches ? [reason] : []
    };
  }

  /**
   * Evaluate composite condition (nested logic)
   */
  private evaluateComposite(
    condition: CompositeCondition,
    analysis: FieldVectorAnalysis,
    fieldVectors: FieldVector[]
  ): EvaluationResult {
    const results = condition.conditions.map(c =>
      this.evaluateCondition(c, analysis, fieldVectors)
    );

    return this.combineResults(results, condition.operator);
  }

  /**
   * Combine multiple evaluation results with AND/OR/NOT logic
   */
  private combineResults(
    results: EvaluationResult[],
    operator: "AND" | "OR" | "NOT"
  ): EvaluationResult {
    if (results.length === 0) {
      return { matches: false, score: 0, reasons: [] };
    }

    let matches = false;
    let score = 0;
    const reasons: string[] = [];

    switch (operator) {
      case "AND":
        matches = results.every(r => r.matches);
        // Average score of all conditions (all must match)
        score = matches
          ? results.reduce((sum, r) => sum + r.score, 0) / results.length
          : 0;
        break;

      case "OR":
        matches = results.some(r => r.matches);
        // Max score of any matching condition
        score = Math.max(...results.map(r => r.score));
        break;

      case "NOT":
        // NOT inverts the first condition
        matches = !results[0].matches;
        score = matches ? 1.0 : 0;
        break;
    }

    // Collect reasons from all matching conditions
    if (matches) {
      for (const result of results) {
        if (result.matches) {
          reasons.push(...result.reasons);
        }
      }
    }

    return { matches, score, reasons };
  }
}

// ========== Helper Types ==========

interface EvaluationResult {
  matches: boolean;
  score: number; // 0-1 scale
  reasons: string[]; // Human-readable explanations
}
