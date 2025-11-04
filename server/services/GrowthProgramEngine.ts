/**
 * Growth Program Engine - Main orchestrator for consciousness-aware workflow modes
 * 
 * Interprets transit field vectors and activates appropriate growth programs
 */

import type {
  FieldVectorAnalysis,
  CompositeDirective,
  ProgramActivation
} from "../../shared/growth-programs";
import type { FieldVector, Planet } from "../../shared/transit-system";
import { ARCHETYPAL_PROGRAMS } from "../../shared/growth-programs";
import { RulesEngine } from "./RulesEngine";
import { DirectiveSynthesizer } from "./DirectiveSynthesis";
import type { TransitProjection } from "../../shared/transit-system";

export class GrowthProgramEngine {
  private rulesEngine: RulesEngine;
  private synthesizer: DirectiveSynthesizer;

  constructor() {
    this.rulesEngine = new RulesEngine();
    this.synthesizer = new DirectiveSynthesizer();
  }

  /**
   * Get recommended workspace directive based on current transits and user chart
   */
  getWorkspaceDirective(
    fieldVectors: FieldVector[],
    projections: {
      sidereal: TransitProjection;
      tropical: TransitProjection;
      draconic: TransitProjection;
    }
  ): CompositeDirective {
    // Build field vector analysis
    const analysis = this.buildFieldAnalysis(fieldVectors, projections);

    // Evaluate all programs against current state
    const activations = this.rulesEngine.evaluatePrograms(
      ARCHETYPAL_PROGRAMS,
      analysis,
      fieldVectors
    );

    // Synthesize top programs into composite directive
    const directive = this.synthesizer.synthesize(activations);

    return directive;
  }

  /**
   * Get detailed program activations (for debugging/UI display)
   */
  getProgramActivations(
    fieldVectors: FieldVector[],
    projections: {
      sidereal: TransitProjection;
      tropical: TransitProjection;
      draconic: TransitProjection;
    }
  ): ProgramActivation[] {
    const analysis = this.buildFieldAnalysis(fieldVectors, projections);
    
    return this.rulesEngine.evaluatePrograms(
      ARCHETYPAL_PROGRAMS,
      analysis,
      fieldVectors
    );
  }

  /**
   * Build field vector analysis from current transit data
   */
  private buildFieldAnalysis(
    fieldVectors: FieldVector[],
    projections: {
      sidereal: TransitProjection;
      tropical: TransitProjection;
      draconic: TransitProjection;
    }
  ): FieldVectorAnalysis {
    // Build pressure map (field -> transit pressure)
    const pressureMap: Record<string, number> = {};
    const resonanceMap: Record<string, number> = {};
    const dominantFields: string[] = [];

    for (const vector of fieldVectors) {
      pressureMap[vector.field] = vector.transitPressure;
      resonanceMap[vector.field] = vector.historicalResonance;

      // Fields with high combined weight are dominant
      if (vector.weight > 0.5) {
        dominantFields.push(vector.field);
      }
    }

    // Build aspect map (planet -> current aspect status)
    const aspectMap: Record<string, string> = {};
    
    // Use tropical projection for aspect analysis (most dynamic)
    for (const position of projections.tropical.positions) {
      const planet = position.planet;
      
      // Determine aspect based on speed and retrograde status
      let aspect: string;
      if (position.retrograde) {
        aspect = "retrograde";
      } else if (position.speed > this.getAverageSpeed(planet)) {
        aspect = "fast";
      } else if (position.speed < this.getAverageSpeed(planet) * 0.7) {
        aspect = "slow";
      } else {
        aspect = "direct";
      }

      aspectMap[planet] = aspect;
    }

    return {
      dominantFields: dominantFields as any,
      pressureMap: pressureMap as any,
      resonanceMap: resonanceMap as any,
      aspectMap
    };
  }

  /**
   * Get average daily speed for a planet (for aspect detection)
   */
  private getAverageSpeed(planet: Planet): number {
    const speeds: Record<Planet, number> = {
      Sun: 1.0,
      Moon: 13.2,
      Mercury: 1.6,
      Venus: 1.2,
      Mars: 0.5,
      Jupiter: 0.08,
      Saturn: 0.03,
      Uranus: 0.01,
      Neptune: 0.006,
      Pluto: 0.004,
      NorthNode: -0.05, // Retrograde
      Chiron: 0.06
    };

    return speeds[planet] || 0.5;
  }
}

// Singleton instance
export const growthProgramEngine = new GrowthProgramEngine();
